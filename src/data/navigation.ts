import type { NavigationItem } from '../types';
import {
  serviceCategories as servicesData,
  governmentCategories,
} from './yamlLoader';

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
    href: '/government/officials',
    children: [
      {
        label: 'Officials',
        href: '/government/officials',
      },
      {
        label: 'Barangays',
        href: '/government/barangays',
      },
    ],
  },
  {
    label: 'Transparency',
    href: '/government/transparency-documents',
    children: [
      {
        label: 'Transparency Documents',
        href: '/government/transparency-documents',
      },
      {
        label: 'Guides and Regulations',
        href: '/government/guides-and-regulations',
      },
      {
        label: 'Reports',
        href: '/government/reports-and-statistics',
      },
    ],
  },
  {
    label: 'Statistics',
    href: governmentCategories.categories.find(
      category => category.slug === 'reports-and-statistics'
    )?.slug
      ? '/government/reports-and-statistics'
      : '/government',
  },
];

export const footerNavigation = {
  mainSections: [
    {
      title: 'About',
      links: [
        { label: 'About the Portal', href: '/about' },
        // { label: 'Privacy Policy', href: '/privacy' },
        // { label: 'Terms of Use', href: '/terms' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Contact Us', href: '/about' },
        // { label: 'Community Discord', href: '/discord' },
      ],
    },
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
        { label: 'Hotlines', href: '/philippines/hotlines' },
        { label: 'Holidays', href: '/philippines/holidays' },
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
  socialLinks: [{ label: 'Facebook', href: 'https://facebook.com/govph' }],
};
