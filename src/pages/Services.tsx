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
    layout: 'list',
    pages: [],
  });
  const [loading, setLoading] = useState(false);
  const subcategories: Subcategory[] = categoryIndex.pages;

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
          title="Services"
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
            Services
          </Heading>
          <Text className="text-gray-600 mb-6">
            All services provided by the {import.meta.env.VITE_GOVERNMENT_NAME}{' '}
            government. Find what you need for citizenship, business, education,
            and more.
          </Text>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servicePages.map(service => (
              <Link key={service.slug} to={`/services/${service.slug}`}>
                <Card
                  hoverable
                  className="h-full border-t-4 border-primary-500"
                >
                  <CardContent>
                    <h4 className="text-lg font-medium text-gray-900">
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
                {subcategories.map(subcategory => (
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
                {subcategories.map(subcategory => (
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
          </>
        )}
      </Section>
    </>
  );
};

export default Services;
