import React from 'react';
import img from '../img/s.png'
const ArmyWallpaper = () => {
    return (
        <div>
            <img
                src={img}
                alt="Army Wallpaper"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    objectFit: 'cover',
                    zIndex: -1,
                    filter: 'brightness(0.4)', // ✅ This darkens the image
                }}
            />
        </div>
    );
};

export default ArmyWallpaper;
