import React, { useState, useContext, useEffect } from 'react';
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
import GooglePayButton from "@google-pay/button-react";

import { generateMockProductData } from '../../helpers/mock';
import Icon from '../../components/Icons/Icon';
import ProductCardGrid from '../../components/ProductCardGrid';
import { navigate } from 'gatsby';

import AddItemNotificationContext from '../../context/AddItemNotificationProvider';

const ProductPage = (props) => {
  const [signalFetched, setSignalFetched]=useState(false);
  const [isActivePPUser, setIsActivePPUser] = useState(false);
  const ctxAddItemNotification = useContext(AddItemNotificationContext);
  const showNotification = ctxAddItemNotification.showNotification;
  const sampleProduct = generateMockProductData(1, 'sample')[0];
  const [qty, setQty] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);
  const [showApplePay, setShowApplePay] = useState();
  const [activeSwatch, setActiveSwatch] = useState(
    sampleProduct.colorOptions[0]
  );
  const [activeSize, setActiveSize] = useState(sampleProduct.sizeOptions[0]);
  const suggestions = generateMockProductData(4, 'woman');

  useEffect(() => {
      if(!!window.ApplePaySession) {
          setShowApplePay('inline-block');
      } else {
          setShowApplePay('none');
      }
  },[]);


    // load signal sdk
  const signlSdkStatus = useScript(
    `https://www.paypal.com/identity/di/signal?load=sdk`,
    {
      removeOnUnmount: false,
    }
  );

  useEffect(()=> {
    if(window.paypal_signal !== undefined) {
      const isActiveUser = window.paypal_signal.isActiveUser("AafBGhBphJ66SHPtbCMTsH1q2HQC2lnf0ER0KWAVSsOqsAtVfnye5Vc8hAOC");
      console.log(`SDK response:`);
      console.log(isActiveUser);
      setSignalFetched(true);
      //setIsActivePPUser(isActivUser.activeUser);
      setIsActivePPUser(true);
    }
  }, [signlSdkStatus]);


  // load SPB script
  const spbSdkStatus = useScript(
    `https://www.paypal.com/sdk/js?client-id=AR3mYkDZnP2vquHAVx1BXgw1tSv-zVTYQrwRmazeGbsaXEYJnVK9oes-dw4rDGShU07C6TuTCknhTI8G&currency=USD`,
    {
      removeOnUnmount: false,
    }
  );

  useEffect(()=> {
    if(spbSdkStatus === 'ready' && isActivePPUser === true) {
      window.paypal.Buttons({

        // Call your server to set up the transaction
        createOrder: function(data, actions) {
            return fetch('/demo/checkout/api/paypal/order/create/', {
                method: 'post'
            }).then(function(res) {
                return res.json();
            }).then(function(orderData) {
                return orderData.id;
            });
        },

        // Call your server to finalize the transaction
        onApprove: function(data, actions) {
            return fetch('/demo/checkout/api/paypal/order/' + data.orderID + '/capture/', {
                method: 'post'
            }).then(function(res) {
                return res.json();
            }).then(function(orderData) {
                // Three cases to handle:
                //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                //   (2) Other non-recoverable errors -> Show a failure message
                //   (3) Successful transaction -> Show confirmation or thank you

                // This example reads a v2/checkout/orders capture response, propagated from the server
                // You could use a different API or structure for your 'orderData'
                var errorDetail = Array.isArray(orderData.details) && orderData.details[0];

                if (errorDetail && errorDetail.issue === 'INSTRUMENT_DECLINED') {
                    return actions.restart(); // Recoverable state, per:
                    // https://developer.paypal.com/docs/checkout/integration-features/funding-failure/
                }

                if (errorDetail) {
                    var msg = 'Sorry, your transaction could not be processed.';
                    if (errorDetail.description) msg += '\n\n' + errorDetail.description;
                    if (orderData.debug_id) msg += ' (' + orderData.debug_id + ')';
                    return alert(msg); // Show a failure message (try to avoid alerts in production environments)
                }

                // Successful capture! For demo purposes:
                console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
                var transaction = orderData.purchase_units[0].payments.captures[0];
                alert('Transaction '+ transaction.status + ': ' + transaction.id + '\n\nSee console for all available details');

                // Replace the above to show a success message within this page, e.g.
                // const element = document.getElementById('paypal-button-container');
                // element.innerHTML = '';
                // element.innerHTML = '<h3>Thank you for your payment!</h3>';
                // Or go to another URL:  actions.redirect('thank_you.html');
            });
        }

      }).render('#paypal-button-container');
    }
  }, [spbSdkStatus, isActivePPUser])

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
              </div>
            <br/>
            <div id = "paypal-button-container">
                {!signalFetched && <PulseLoader color="#36d7b7" />}
            </div>

            <button className={styles.applePayButton} style={{display: showApplePay}}></button>

            <GooglePayButton
                environment="TEST"
                paymentRequest={{
                    apiVersion: 2,
                    apiVersionMinor: 0,
                    allowedPaymentMethods: [
                        {
                            type: 'CARD',
                            parameters: {
                                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                allowedCardNetworks: ['MASTERCARD', 'VISA'],
                            },
                            tokenizationSpecification: {
                                type: 'PAYMENT_GATEWAY',
                                parameters: {
                                    gateway: 'example',
                                    gatewayMerchantId: 'exampleGatewayMerchantId',
                                },
                            },
                        },
                    ],
                    merchantInfo: {
                        merchantId: '12345678901234567890',
                        merchantName: 'Demo Merchant',
                    },
                    transactionInfo: {
                        totalPriceStatus: 'FINAL',
                        totalPriceLabel: 'Total',
                        totalPrice: '100.00',
                        currencyCode: 'USD',
                        countryCode: 'US',
                    },
                }}
                onLoadPaymentData={paymentRequest => {
                    console.log('load payment data', paymentRequest);
                }}
                buttonSizeMode={'fill'}
                buttonType={'buy'}
                style={{width: '100%', marginBottom: '10px', display: showApplePay==='inline-block'?'none':'inline-block'}}
            />

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
