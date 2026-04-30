import type { NavigationItem } from '../types';
import { serviceCategories as servicesData } from './yamlLoader';

interface Subcategory {
  name: string;
  slug: string;
}

interface Category {
  category: string;
  slug: string;
  subcategories: Subcategory[];
}

export const mainNavigation: NavigationItem[] = [
  // {
  //   label: 'Home',
  //   href: '/',
  // },
  {
    label: 'Services',
    href: '/services',
    children: (servicesData.categories as Category[]).map(category => ({
      label: category.category,
      href: `/services/${category.slug}`,
    })),
  },
  {
    label: 'Government',
    href: '/government',
    children: [
      {
        label: 'Leadership',
        href: '/government/leadership',
      },
      {
        label: 'Barangays',
        href: '/government/barangays',
      },
    ],
  },
  {
    label: 'Transparency',
    href: '/transparency',
    children: [
      {
        label: 'Income and Dependency',
        href: '/transparency/income-and-dependency',
      },
      {
        label: 'Local Financial Data',
        href: '/transparency/local-financial-data',
      },
    ],
  },
  {
    label: 'Statistics',
    href: '/statistics',
    children: [
      {
        label: 'Demographics',
        href: '/statistics/demographics',
      },
      {
        label: 'Competitiveness',
        href: '/statistics/competitiveness',
      },
    ],
  },
];

export const footerNavigation = {
  mainSections: [
    // {
    //   title: 'About',
    //   links: [
    //     { label: 'About the Portal', href: '/about' },
    //     // { label: 'Privacy Policy', href: '/privacy' },
    //     { label: 'Accessibility', href: '/accessibility' },
    //     { label: 'Feedback', href: '' },
    //     // { label: 'Community Discord', href: '/discord' },
    //   ],
    // },
    {
      title: 'Services',
      links: [
        { label: 'All Services', href: '/services' },
        ...(servicesData.categories as Category[])
          .slice(0, 6)
          .map(category => ({
            label: category.category,
            href: `/services/${category.slug}`,
          })),
      ],
    },
    {
      title: 'Government',
      links: [
        {
          label: 'Official Gazette',
          href: 'https://www.officialgazette.gov.ph',
        },
        { label: 'Open Data', href: 'https://data.gov.ph' },
        { label: 'Freedom of Information', href: 'https://www.foi.gov.ph' },
        {
          label: 'Contact Center',
          href: 'https://contactcenterngbayan.gov.ph',
        },
      ],
    },
  ],
  socialLinks: [
    { label: 'Facebook', href: 'https://facebook.com/betteraparri.org' },
    { label: 'GitHub', href: 'https://github.com/egiebk/betteraparri' },
  ],
};
