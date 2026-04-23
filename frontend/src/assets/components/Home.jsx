import React from 'react';
import Nev from './Nev';
import AnimatedCart from './AnimatedCard';
import PublicAds from './PublicAds';
import Banners from './Banners';
import Footer from './Footer';
import TrendingItems from './TrendingItems';
import Categories from './Categories';
import ComingSoon from './ComingSoon';

const Home = () => {
  return (
    <div>
      <Nev />
      <AnimatedCart />

      {/* Seller Ad Campaigns Carousel */}
      <PublicAds />

      {/* Dynamic Banners from Admin Config */}
      <Banners />

      {/* Trending Products from Admin Config */}
      {/* <TrendingItems /> */}

      <ComingSoon />

      <Footer />
    </div>
  );
};

export default Home;
