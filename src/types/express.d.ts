import { IAdminUser } from '../models/AdminUser';
import { TokenPayload } from '../utils/token';

declare global {
  namespace Express {
    interface Request {
      adminUser?: IAdminUser;
      tokenPayload?: TokenPayload;
    }
  }
}
