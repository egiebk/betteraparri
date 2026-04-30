import Section from '../components/ui/Section';
import { useParams, Link } from 'react-router-dom';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import {
  serviceCategories,
  getCategorySubcategories,
  type Subcategory,
  type CategoryIndex,
  type Category,
} from '../data/yamlLoader';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import { Card, CardContent } from '@bettergov/kapwa/card';
import { Banner } from '@bettergov/kapwa/banner';
import { useState, useEffect } from 'react';

const RemixIcon: React.FC<{ iconClass: string; className?: string }> = ({
  iconClass,
  className = 'h-8 w-8',
}) => <i className={`${iconClass} ${className}`} />;

const Services: React.FC = () => {
  const { category } = useParams();
  const [categoryIndex, setCategoryIndex] = useState<CategoryIndex>({
    layout: 'grid',
    pages: [],
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const subcategories: Subcategory[] = categoryIndex.pages;
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const getCategory = () => {
    return serviceCategories.categories.find(c => c.slug === category);
  };

  const categoryData = getCategory();
  const servicePages: Subcategory[] = serviceCategories.categories.map(
    (serviceCategory: Category) => ({
      name: serviceCategory.category,
      slug: serviceCategory.slug,
      description: serviceCategory.description,
    })
  );
  const filteredServicePages = servicePages.filter(service => {
    if (!normalizedSearch) {
      return true;
    }

    return `${service.name} ${service.description ?? ''}`
      .toLowerCase()
      .includes(normalizedSearch);
  });
  const filteredSubcategories = subcategories.filter(subcategory => {
    if (!normalizedSearch) {
      return true;
    }

    return `${subcategory.name} ${subcategory.description ?? ''}`
      .toLowerCase()
      .includes(normalizedSearch);
  });

  useEffect(() => {
    if (category && categoryData) {
      setLoading(true);
      getCategorySubcategories(category)
        .then(setCategoryIndex)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [category, categoryData]);

  if (!category) {
    return (
      <>
        <SEO
          title="Citizen Services"
          description={`All services provided by the ${import.meta.env.VITE_GOVERNMENT_NAME} government. Find what you need for citizenship, business, education, and more.`}
          keywords="government services, public services, local government, civic services"
        />
        <Section className="p-3 mb-12">
          <Breadcrumbs className="mb-8" />
          <Heading className="mb-2 flex items-center gap-3">
            <RemixIcon
              iconClass="ri-gallery-view-2"
              className="md:text-5xl text-sm text-sky-600"
            />
            Citizen Services
          </Heading>
          <Text className="text-gray-600 mb-6">
            Find requirements, steps, offices, and contact details for common
            local government services in Aparri.
          </Text>
          <div className="relative mb-6">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search for a service, office, or requirement..."
              className="w-full rounded-md border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServicePages.map(service => (
              <Link key={service.slug} to={`/services/${service.slug}`}>
                <Card
                  hoverable
                  className="h-full border-t-4 border-primary-500"
                >
                  <CardContent>
                    <h4 className="text-xl font-medium text-gray-900">
                      {service.name}
                    </h4>
                    {service.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {service.description}
                      </p>
                    )}
                    <span className="inline-block px-2 py-1 mt-2 text-xs font-medium rounded-sm bg-gray-100 text-gray-800">
                      Services
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {filteredServicePages.length === 0 && (
            <Text className="mt-6 text-gray-600">
              No service categories match your search.
            </Text>
          )}
        </Section>
      </>
    );
  }
  if (!categoryData) {
    return (
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        <Banner
          type="error"
          title="Category not found"
          description="The category you are looking for does not exist."
          icon
        />
      </Section>
    );
  }

  return (
    <>
      <SEO
        title={categoryData.category || category}
        description={categoryData.description}
        keywords={`${categoryData.category}, government services, public services, local government`}
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        <Heading className="mb-2 flex items-center gap-3">
          {categoryData?.icon && (
            <RemixIcon
              iconClass={categoryData.icon}
              className="md:text-5xl text-sm text-sky-600"
            />
          )}
          {categoryData.category || category}
        </Heading>
        <Text className="text-gray-600 mb-6">{categoryData.description}</Text>
        <div className="relative mb-6">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Search for a service, office, or requirement..."
            className="w-full rounded-md border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Text>Loading services...</Text>
          </div>
        ) : (
          <>
            {categoryIndex.title && (
              <Heading level={3}>{categoryIndex.title}</Heading>
            )}
            {categoryIndex.description && (
              <Text className="text-gray-600 mb-4">
                {categoryIndex.description}
              </Text>
            )}
            {categoryIndex.layout === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSubcategories.map(subcategory => (
                  <Link
                    key={subcategory.slug}
                    to={`/services/${category}/${subcategory.slug}`}
                  >
                    <Card
                      hoverable
                      className="h-full border-t-4 border-primary-500"
                    >
                      <CardContent>
                        <h4 className="text-lg font-medium text-gray-900">
                          {subcategory.name}
                        </h4>
                        {subcategory.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {subcategory.description}
                          </p>
                        )}
                        <span className="inline-block px-2 py-1 mt-2 text-xs font-medium rounded-sm bg-gray-100 text-gray-800">
                          {categoryData.category || category}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubcategories.map(subcategory => (
                  <Link
                    key={subcategory.slug}
                    to={`/services/${category}/${subcategory.slug}`}
                  >
                    <Card hoverable className="mb-4">
                      <CardContent>
                        <h4 className="text-lg font-medium text-gray-900">
                          {subcategory.name}
                        </h4>
                        {subcategory.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {subcategory.description}
                          </p>
                        )}
                        <span className="inline-block px-2 py-1 mt-2 text-xs font-medium rounded-sm bg-gray-100 text-gray-800">
                          {categoryData.category || category}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            {filteredSubcategories.length === 0 && (
              <Text className="mt-6 text-gray-600">
                No services match your search in this category.
              </Text>
            )}
          </>
        )}
      </Section>
    </>
  );
};

export default Services;
