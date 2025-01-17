import { sdkService } from '@commercetool/sdk.service';
import { ProductProjection } from '@commercetools/platform-sdk';
import { Container } from '@components/Container/Container';
import { useCategories } from '@contexts/categoryProvider';
import { AppRoutes } from '@router/routes';
import { dateSorting } from '@utils/utils';
import { FC, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NewArrivalsCard } from '../NewArrivalsCard/NewArrivalsCard';
import styles from './NewArrivals.module.scss';

export const NewArrivals: FC = ({ ...props }) => {
   const [products, setProducts] = useState<ProductProjection[]>([]);
   const { catalogCategories } = useCategories();
   const cardNumber = 4;

   const updateProductsState = useCallback(async () => {
      const prods = await sdkService.getProducts();
      const sortedProds = dateSorting(prods);
      setProducts(sortedProds.slice(0, cardNumber));
   }, []);

   useEffect(() => {
      updateProductsState();
   }, [updateProductsState]);

   return (
      <section className={styles.newarrivals}>
         <Container classname={styles.newarrivals}>
            <div className={styles.newarrivalsBody}>
               <div className={styles.newarrivalsHeader}>
                  <h2 className={styles.newarrivalsTitle}>New Arrivals</h2>
                  <Link to={AppRoutes.CATALOG_ROUTE} className={styles.newarrivalsShopall}>
                     Shop All
                  </Link>
               </div>

               <div className={styles.newarrivalsList} {...props}>
                  {catalogCategories &&
                     Object.values(catalogCategories).length > 0 &&
                     products.map((product: ProductProjection) => {
                        return <NewArrivalsCard key={product.id} product={product} categories={catalogCategories} />;
                     })}
               </div>
            </div>
         </Container>
      </section>
   );
};
