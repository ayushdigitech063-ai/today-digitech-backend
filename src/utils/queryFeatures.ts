import { Query } from 'mongoose';
import { PaginationMeta } from '@today-digitech/shared';

export interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  search?: string;
  [key: string]: any;
}

export class QueryFeatures<T> {
  public query: Query<T[], T>;
  public queryString: QueryParams;
  public totalDocs = 0;

  constructor(query: Query<T[], T>, queryString: QueryParams) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1. Text Search & Filtering
  filter(searchFields: string[] = []) {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering (gt, gte, lt, lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let filterObject = JSON.parse(queryStr);

    // Search query using regex across specified search fields
    if (this.queryString.search && searchFields.length > 0) {
      const searchRegex = new RegExp(this.queryString.search, 'i');
      const searchConditions = searchFields.map((field) => ({
        [field]: searchRegex,
      }));
      filterObject = {
        ...filterObject,
        $or: searchConditions,
      };
    }

    this.query = this.query.find(filterObject);
    return this;
  }

  // 2. Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // 3. Field Limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // 4. Pagination
  async paginate(): Promise<{ meta: PaginationMeta }> {
    const page = Math.max(1, parseInt(this.queryString.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(this.queryString.limit || '10', 10)));
    const skip = (page - 1) * limit;

    // Count documents matching current query filter
    const countQuery = this.query.model.find(this.query.getFilter());
    const total = await countQuery.countDocuments();
    const totalPages = Math.ceil(total / limit);

    this.query = this.query.skip(skip).limit(limit);

    return {
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
