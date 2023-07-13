import React, { useState, useContext, useEffect } from 'react';
import { PayPalButton } from "react-paypal-button-v2";
import { PulseLoader } from 'react-spinners';
import { useScript } from "@uidotdev/usehooks";
import * as styles from './sample.module.css';

import Accordion from '../../components/Accordion';
import AdjustItem from '../../components/AdjustItem';
import Button from '../../components/Button';
import Breadcrumbs from '../../components/Breadcrumbs';
import Container from '../../components/Container';
import CurrencyFormatter from '../../components/CurrencyFormatter';
import Gallery from '../../components/Gallery';
import SizeList from '../../components/SizeList';
import Split from '../../components/Split';
import SwatchList from '../../components/SwatchList';
import Layout from '../../components/Layout/Layout';

import { generateMockProductData } from '../../helpers/mock';
import Icon from '../../components/Icons/Icon';
import ProductCardGrid from '../../components/ProductCardGrid';
import { navigate } from 'gatsby';

import AddItemNotificationContext from '../../context/AddItemNotificationProvider';

const ProductPage = (props) => {
  const [signalFetched, setSignalFetched]=useState(false);
  const ctxAddItemNotification = useContext(AddItemNotificationContext);
  const showNotification = ctxAddItemNotification.showNotification;
  const sampleProduct = generateMockProductData(1, 'sample')[0];
  const [qty, setQty] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);
  const [activeSwatch, setActiveSwatch] = useState(
    sampleProduct.colorOptions[0]
  );
  const [activeSize, setActiveSize] = useState(sampleProduct.sizeOptions[0]);
  const suggestions = generateMockProductData(4, 'woman');

  const signlSdkStatus = useScript(
    `https://www.paypal.com/identity/di/signal?load=sdk`,
    {
      removeOnUnmount: false,
    }
  );

  useEffect(()=> {
    if(window.paypal_signal !== undefined) {
      const isActivUser = window.paypal_signal.isActiveUser("AafBGhBphJ66SHPtbCMTsH1q2HQC2lnf0ER0KWAVSsOqsAtVfnye5Vc8hAOC");
      console.log(`SDK response:`);
      console.log(isActivUser);
      //setSignalFetched(isActivUser.activeUser);
      setSignalFetched(true);
    }
  }, [signlSdkStatus])



  return (
    <Layout>
      <div className={styles.root}>
        {/* <Helmet>
          <script src="https://www.paypal.com/identity/di/signal?load=sdk" type="text/javascript" />
        </Helmet> */}
        <Container size={'large'} spacing={'min'}>
          <Breadcrumbs
            crumbs={[
              { link: '/', label: 'Home' },
              { label: 'Men', link: '/shop' },
              { label: 'Sweater', link: '/shop' },
              { label: `${sampleProduct.name}` },
            ]}
          />
          <div className={styles.content}>
            <div className={styles.gallery}>
              <Gallery images={sampleProduct.gallery} />
            </div>
            <div className={styles.details}>
              <h1>{sampleProduct.name}</h1>
              <span className={styles.vendor}> by {sampleProduct.vendor}</span>

              <div className={styles.priceContainer}>
                <CurrencyFormatter appendZero amount={sampleProduct.price} />
              </div>

              <div>
                <SwatchList
                  swatchList={sampleProduct.colorOptions}
                  activeSwatch={activeSwatch}
                  setActiveSwatch={setActiveSwatch}
                />
              </div>

              <div className={styles.sizeContainer}>
                <SizeList
                  sizeList={sampleProduct.sizeOptions}
                  activeSize={activeSize}
                  setActiveSize={setActiveSize}
                />
              </div>

              <div className={styles.quantityContainer}>
                <span>Quantity</span>
                <AdjustItem qty={qty} setQty={setQty} />
              </div>

              <div className={styles.actionContainer}>
                <div className={styles.addToButtonContainer}>
                  <Button
                    onClick={() => showNotification()}
                    fullWidth
                    level={'primary'}
                  >
                    Add to Bag
                  </Button>
                </div>

                <div
                  className={styles.wishlistActionContainer}
                  role={'presentation'}
                  onClick={() => setIsWishlist(!isWishlist)}
                >
                  <Icon symbol={'heart'}></Icon>
                  <div
                    className={`${styles.heartFillContainer} ${
                      isWishlist === true ? styles.show : styles.hide
                    }`}
                  >
                    <Icon symbol={'heartFill'}></Icon>
                  </div>
                </div>

                <div>
                  {signalFetched && 
                    <PayPalButton
                      amount="0.01"
                      // shippingPreference="NO_SHIPPING" // default is "GET_FROM_FILE"
                      onSuccess={(details, data) => {
                        alert("Transaction completed by " + details.payer.name.given_name);

                        // OPTIONAL: Call your server to save the transaction
                        return fetch("/paypal-transaction-complete", {
                          method: "post",
                          body: JSON.stringify({
                            orderID: data.orderID
                          })
                        });
                      }}

                      options={{
                        clientId: "AR3mYkDZnP2vquHAVx1BXgw1tSv-zVTYQrwRmazeGbsaXEYJnVK9oes-dw4rDGShU07C6TuTCknhTI8G"
                      }}
                      />
                  }
                 {!signalFetched && <PulseLoader color="#36d7b7" />}
                </div>

              </div>

              <div className={styles.description}>
                <p>{sampleProduct.description}</p>
                <span>Product code: {sampleProduct.productCode}</span>
              </div>

              <div className={styles.informationContainer}>
                <Accordion
                  type={'plus'}
                  customStyle={styles}
                  title={'composition & care'}
                >
                  <p className={styles.information}>
                    {sampleProduct.description}
                  </p>
                </Accordion>
                <Accordion
                  type={'plus'}
                  customStyle={styles}
                  title={'delivery & returns'}
                >
                  <p className={styles.information}>
                    {sampleProduct.description}
                  </p>
                </Accordion>
                <Accordion type={'plus'} customStyle={styles} title={'help'}>
                  <p className={styles.information}>
                    {sampleProduct.description}
                  </p>
                </Accordion>
              </div>
            </div>
          </div>
          <div className={styles.suggestionContainer}>
            <h2>You may also like</h2>
            <ProductCardGrid
              spacing
              showSlider
              height={400}
              columns={4}
              data={suggestions}
            />
          </div>
        </Container>

        <div className={styles.attributeContainer}>
          <Split
            image={'/cloth.png'}
            alt={'attribute description'}
            title={'Sustainability'}
            description={
              'We design our products to look good and to be used on a daily basis. And our aim is to inspire people to live with few timeless objects made to last. This is why quality over quantity is a cornerstone of our ethos and we have no interest in trends or seasonal collections.'
            }
            ctaText={'learn more'}
            cta={() => navigate('/blog')}
            bgColor={'var(--standard-light-grey)'}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductPage;
