import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import * as styles from './ProductCard.module.css';

import { Helmet } from 'react-helmet';
import Icon from '../Icons/Icon';
import CurrencyFormatter from '../CurrencyFormatter';

const ProductCard = (props) => {
  const hash_id = '44d20311569a4';
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://cdn-${hash_id}.static.engineering.dev.paypalinc.com/lollipop/lollipop.min.js`;
    script.async = true;

    script.onload = () => {
      // Safe to use the script's functions now
      const widget = new window.P13NWidget();
      widget.render({
        position: window.P13NWidget.POSITIONS.TOP_RIGHT,
        message: 'Hello from the top right!',
        backgroundColor: '#e74c3c',
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Clean up when component unmounts
    };
  }, []);
  const [isWishlist, setIsWishlist] = useState(false);
  const {
    image,
    imageAlt,
    name,
    price,
    originalPrice,
    meta,
    showQuickView,
    height = 580,
  } = props;

  const handleRouteToProduct = () => {
    navigate('/product/sample');
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    showQuickView();
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsWishlist(!isWishlist);
  };

  return (
    <div className={styles.root}>
      <Helmet>
        <script
          src="https://floating-widget-two.vercel.app/floating-widget.js"
          type="text/javascript"
        />
      </Helmet>
      <div
        className={styles.imageContainer}
        onClick={() => handleRouteToProduct()}
        role={'presentation'}
      >
        <img style={{ height: `${height}px` }} src={image} alt={imageAlt}></img>
        <div
          className={styles.bagContainer}
          role={'presentation'}
          onClick={(e) => handleQuickView(e)}
        >
          <Icon symbol={'bagPlus'} />
        </div>
        <div
          className={styles.heartContainer}
          role={'presentation'}
          onClick={(e) => handleFavorite(e)}
        >
          <Icon symbol={'heart'} />
          <div
            className={`${styles.heartFillContainer} ${
              isWishlist === true ? styles.show : styles.hide
            }`}
          >
            <Icon symbol={'heartFill'}></Icon>
          </div>
        </div>
      </div>
      <div className={styles.detailsContainer}>
        <span className={styles.productName}>{name}</span>
        <div className={styles.prices}>
          <span
            className={`${originalPrice !== undefined ? styles.salePrice : ''}`}
          >
            <CurrencyFormatter amount={price}></CurrencyFormatter>
          </span>
          {originalPrice && (
            <span className={styles.originalPrice}>
              <CurrencyFormatter amount={originalPrice}></CurrencyFormatter>
            </span>
          )}
        </div>
        <span className={styles.meta}>{meta}</span>
      </div>
    </div>
  );
};

export default ProductCard;
