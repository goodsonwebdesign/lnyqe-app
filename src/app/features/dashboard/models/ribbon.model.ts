export interface RibbonAction {
  id: string;
  label: string;
  icon: string; // For an icon library like Iconify
  route?: string;
}

export interface RibbonGroup {
  id: string;
  title: string;
  actions: RibbonAction[];
}

export interface RibbonTab {
  id: string;
  title: string;
  groups: RibbonGroup[];
}
