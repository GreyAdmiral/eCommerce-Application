import heart from '@assets/heart.svg';
import { sdkService } from '@commercetool/sdk.service';
import {
   CartRemoveLineItemAction,
   CartUpdateAction,
   MyCartAddLineItemAction,
   MyCartRemoveLineItemAction,
   ProductProjection,
   ProductVariant,
} from '@commercetools/platform-sdk';
import { Breadcrumbs } from '@components/Breadcrumbs/Breadcrumbs';
import { Container } from '@components/Container/Container';
import { Footer } from '@components/Footer/Footer';
import { Header } from '@components/Header/Header';
import { Loader } from '@components/Loader/Loader';
import { PriceView } from '@components/PriceView/PriceView';
import { ProductAttributes, ProductAttributesView } from '@components/ProductAttributes/ProductAttributesView';
import { ProductInfoSection } from '@components/ProductInfoSection/ProductInfoSection';
import { QuantityInput } from '@components/QuantityInput/QuantityInput';
import { Slider } from '@components/Slider/Slider';
import { useCart } from '@contexts/cartProvider';
import { useCategories } from '@contexts/categoryProvider';
import { useToast } from '@contexts/toastProvider';
import { ProductAddToCart, ProductRemoveFromCart } from '@utils/constants';
import { assertValue, convertProductAttributesArrayToObject } from '@utils/utils';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './productItem.module.scss';

export function ProductItem() {
   const { category, subcategory, slug } = useParams();

   assertValue(category, "can't find the product category");
   assertValue(slug, "can't find the product key (slug)");

   const navigate = useNavigate();
   const { cart, setCart } = useCart();

   const [showHeart, setShowHeart] = useState(false);
   const [isInCart, setIsInCart] = useState<boolean>(false);
   const [cartItemId, setCartItemId] = useState<string | null>(null);
   const [product, setProduct] = useState<ProductProjection>({} as ProductProjection);
   const [loading, setLoading] = useState<boolean>(true);
   const [activeVariant, setActiveVariant] = useState<ProductVariant>({} as ProductVariant);
   const [quantity, setQuantity] = useState(1);

   const { categories, checkProductRoute } = useCategories();
   const { customToast, errorNotify, successNotify } = useToast();

   useEffect(() => {
      const getProduct = async () => {
         try {
            setLoading(true);

            const data = await sdkService.getProductProjectionByKey(slug);

            const isCategoriesCorrect = checkProductRoute([category, subcategory], data.categories);

            if (!isCategoriesCorrect) {
               navigate('/404');
            }

            setProduct(data);
            setActiveVariant(data.masterVariant);

            setLoading(false);
         } catch (err) {
            errorNotify((err as Error).message);
         }
      };

      if (Object.keys(categories).length !== 0) {
         getProduct();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [categories]);

   useEffect(() => {
      const checkIfInCart = () => {
         const cartItem = cart.lineItems.find(
            item => item.productId === product.id && item.variant.id === activeVariant.id
         );
         if (cartItem) {
            setIsInCart(true);
            setCartItemId(cartItem.id);
         } else {
            setIsInCart(false);
            setCartItemId(null);
         }
      };

      if (Object.keys(cart).length > 0 && activeVariant.sku) {
         checkIfInCart();
      }
   }, [cart, activeVariant, product.id]);

   if (loading) {
      return (
         <>
            <Loader />
            {customToast({ position: 'top-center', autoClose: 5000 })};
         </>
      );
   }

   const name = product.name['en-US'];
   const breadcrumbs: string[] = [];
   breadcrumbs.push(category);
   if (subcategory) {
      breadcrumbs.push(subcategory);
   }
   breadcrumbs.push(name);

   const { sku } = activeVariant;
   const price = activeVariant.prices?.[0];
   assertValue(price, 'no price in active variant');

   const { images } = product.masterVariant;
   const { variants } = product;
   const { attributes } = activeVariant;
   const allAttributes: ProductAttributes[] = [];
   if (attributes) {
      allAttributes.push(convertProductAttributesArrayToObject(product.masterVariant.attributes));
   }
   variants.forEach(variant => {
      if (variant.attributes) {
         allAttributes.push(convertProductAttributesArrayToObject(variant.attributes));
      }
   });

   const handleFavoriteClick = () => {
      setShowHeart(true);
      setTimeout(() => {
         setShowHeart(false);
      }, 400);
   };

   const updateCart = async (action: MyCartAddLineItemAction | MyCartRemoveLineItemAction, message: string) => {
      try {
         const data = await sdkService.updateCart(cart.id, cart.version, [action]).then(cartData => {
            successNotify(message);
            return cartData;
         });

         setCart(data);
      } catch (e) {
         errorNotify((e as Error).message);
      }
   };

   const handleAddOrRemoveButtonClick = async () => {
      if (isInCart && cartItemId) {
         const action: CartRemoveLineItemAction = {
            action: 'removeLineItem',
            lineItemId: cartItemId,
         };

         updateCart(action, ProductRemoveFromCart);
      } else {
         const action: CartUpdateAction = {
            action: 'addLineItem',
            productId: product.id,
            variantId: activeVariant.id,
            quantity,
         };

         updateCart(action, ProductAddToCart);
      }
   };

   return (
      <div className={styles.pageWrapper}>
         <Header />
         <Container>
            <div className={styles.wrapper}>
               <Breadcrumbs activeCategorySlug={breadcrumbs} />
               <div className={styles.productOverview}>
                  <Slider images={images} />
                  <section className={styles.productSummary}>
                     <h2 className={styles.productSummaryHeader}>{name}</h2>
                     {sku ? <div className={styles.sku}>SKU: {sku}</div> : ''}
                     <div className={styles.priceLabel}>
                        Price:
                        <PriceView price={price} />
                     </div>
                     <ProductAttributesView
                        activeAttributes={convertProductAttributesArrayToObject(attributes)}
                        allAttributes={allAttributes}
                        setActiveVariant={setActiveVariant}
                        product={product}
                        isCatalog={false}
                     />
                     <div className={styles.buttonsWrapper}>
                        <div className={styles.quantitySelector}>
                           <QuantityInput value={quantity} onChange={setQuantity} />
                        </div>
                        <div className={styles.buttonsWrapper}>
                           <button
                              type="button"
                              className={styles.addToCartButton}
                              onClick={handleAddOrRemoveButtonClick}
                           >
                              {isInCart ? 'remove from cart' : 'add to cart'}
                           </button>
                           <button type="button" className={styles.addToFavoriteButton} onClick={handleFavoriteClick}>
                              <img src={heart} alt="add to favorite" />
                              {showHeart && <img className={styles.heartAnimation} src={heart} alt="flying heart" />}
                           </button>
                        </div>
                     </div>
                     <ProductInfoSection productInfoText={allAttributes[0].details} />
                  </section>
               </div>
               <div className={styles.productDescription}>{product.description?.['en-US']}</div>
            </div>
            {customToast({ position: 'top-center', autoClose: 3000 })}
         </Container>
         <Footer />
      </div>
   );
}
