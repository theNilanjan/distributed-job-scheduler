import { Op } from 'sequelize';
import { getPagination } from './pagination.js';

const allowedDirection = new Set(['ASC', 'DESC']);

export function buildListOptions(query, searchableFields = [], sortableFields = ['createdAt']) {
  const { page, limit, offset } = getPagination(query);
  const sortBy = sortableFields.includes(query.sortBy) ? query.sortBy : sortableFields[0];
  const sortDir = allowedDirection.has(String(query.sortDir || '').toUpperCase()) ? String(query.sortDir).toUpperCase() : 'DESC';
  const where = {};

  if (query.search && searchableFields.length) {
    where[Op.or] = searchableFields.map((field) => ({ [field]: { [Op.like]: `%${query.search}%` } }));
  }

  return { page, limit, offset, order: [[sortBy, sortDir]], where };
}

export function applyExactFilters(where, query, fields) {
  for (const field of fields) {
    if (query[field] !== undefined && query[field] !== '') {
      where[field] = query[field];
    }
  }
  return where;
}
