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
      if (!userId) return res.status(400).json({ error: 'Unauthorized' });
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

      const fileData = {
        userId,
        name,
        type,
        parentId: parentId || 0,
        isPublic: isPublic || false,
      };

      if (type === 'folder') {
        const newFile = await dbClient.createFile(fileData);
        return res.status(201).json({
          id: newFile.ops[0]._id,
          userId: newFile.ops[0].userId,
          name: newFile.ops[0].name,
          type: newFile.ops[0].type,
          isPublic: newFile.ops[0].isPublic,
          parentId: newFile.ops[0].parentId,
        });
      }

      if (type !== 'folder') {
        const path = process.env.FOLDER_PATH || '/tmp/files_manager';
        await fs.mkdir(path, { recursive: true });
        const localPath = `${path}/${uuidv4()}`;
        const buff = Buffer.from(data, 'base64').toString('utf-8');
        await fs.writeFile(localPath, buff, { encoding: 'utf8' });
        fileData.localPath = localPath;
        const file = await dbClient.createFile(fileData);
        return res.status(201).json({
          id: file.ops[0]._id,
          userId: file.ops[0].userId,
          name: file.ops[0].name,
          type: file.ops[0].type,
          isPublic: file.ops[0].isPublic,
          parentId: file.ops[0].parentId,
        });
      }
    } catch (err) {
      console.log(err);
    }

    return res.status(500).json({ error: 'Server error' });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(400).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const file = await dbClient.findFileById(id);
    if (!file) return res.status(404).json({ error: 'Not found' });
    if (file.userId !== userId && !file.isPublic) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(400).json({ error: 'Unauthorized' });
    const parentId = req.query.parentId || 0;
    if (parentId !== 0) {
      const parent = await dbClient.findFileById(parentId);
      if (!parent) return res.status(200).json([]);
      if (parent.type !== 'folder') return res.status(200).json([]);
    }
    const page = parseInt(req.query.page, 10) || 0;

    const pipeline = [
      { $match: { userId, parentId } },
      { $skip: page * 20 },
      { $limit: 20 },
    ];

    const files = await dbClient.aggregateFiles(pipeline);
    const filesArr = [];
    files.forEach((file) => {
      filesArr.push({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    });
    return res.status(200).json(filesArr);
  }
}
export default FilesController;
