export type NavigationLocation =
  | 'header'
  | 'footer-quick'
  | 'footer-services'
  | 'footer-legal';

export interface NavigationItemDTO {
  id: string;
  title: string;
  href: string;
  location: NavigationLocation;
  parentId?: string;
  megaMenuGroup?: string;
  isExternal: boolean;
  openInNewTab: boolean;
  isActive: boolean;
  order: number;
  children?: NavigationItemDTO[];
}
