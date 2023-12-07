import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await dbClient.findUserbyId(userId);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const {
        name, type, parentId, isPublic, data,
      } = req.body;

      if (!name) return res.status(400).json({ error: 'Missing name' });
      if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
      if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

      if (parentId) {
        const parent = await dbClient.findFileById(parentId);
        if (!parent) return res.status(400).json({ error: 'Parent not found' });
        if (parent.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
      }

      let localPath;
      const file = {
        userId,
        name,
        type,
        parentId: parentId || 0,
        isPublic: isPublic || false,
      };

      if (type === 'folder') {
        const result = await dbClient.createFile(file);
        return res.status(201).json({
          id: result.ops[0]._id,
          userId: result.ops[0].userId,
          name: result.ops[0].name,
          type: result.ops[0].type,
          isPublic: result.ops[0].isPublic,
          parentId: result.ops[0].parentId,
        });
      }

      if (type !== 'folder') {
        localPath = await FilesController.saveFile(data);
        file.localPath = localPath;
        const savedData = await dbClient.createFile(file);
        return res.status(201).json({
          id: savedData.ops[0]._id,
          userId: savedData.ops[0].userId,
          name: savedData.ops[0].name,
          type: savedData.ops[0].type,
          isPublic: savedData.ops[0].isPublic,
          parentId: savedData.ops[0].parentId,
        });
      }
    } catch (error) {
      console.error('Error processing file upload:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }

  static async saveFile(data) {
    const dir = process.env.FOLDER_PATH || '/tmp/files_manager';
    await fs.mkdir(dir, { recursive: true });
    const filePath = `${dir}/${uuidv4()}`;
    const fileData = Buffer.from(data, 'base64').toString('utf-8');
    await fs.writeFile(filePath, fileData, { encoding: 'utf8' });
    return filePath;
  }
}

export default FilesController;
