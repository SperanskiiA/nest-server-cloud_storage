import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity, FileType } from './entities/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private repository: Repository<FileEntity>,
  ) {}

  findAll(userId: number, fileType: FileType) {
    const qb = this.repository.createQueryBuilder('file');
    qb.where('file.userId = :userId', { userId });

    if (fileType === FileType.PHOTO) {
      qb.andWhere('file.mimeType ILIKE :type', { type: '%image%' });
    }
    if (fileType === FileType.TRASH) {
      qb.withDeleted().andWhere('file.deletedAt IS NOT NULL');
    }

    return qb.getMany();
  }

  create(file: Express.Multer.File, userId: number) {
    return this.repository.save({
      fileName: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      user: {
        id: userId,
      },
    });
  }

  remove(userId: number, ids: string) {
    const idsArr = ids.split(',');

    const qb = this.repository.createQueryBuilder('file');

    qb.where('id IN (:...ids) AND userId = :userId', {
      ids: idsArr,
      userId,
    });

    return qb.softDelete().execute();
  }
}
