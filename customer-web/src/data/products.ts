import { Product } from '@/store/cartStore';

export const products: Product[] = [
    {
        id: '1',
        title: 'Artisan Chocolate Truffles',
        description: 'Exquisite handcrafted artisan chocolate truffles made with Premium Belgian cocoa. Each piece is delicately infused with subtle flavors to bring a moment of pure bliss.',
        price: 999,
        imageUrl: '/images/chocolate.png',
        category: 'CHOCOLATE'
    },
    {
        id: '2',
        title: 'Stardust Resin Keychain',
        description: 'A beautiful handmade resin keychain with embedded star fragments and soft glowing moon dust. Perfect for adding a touch of magic to your daily carry.',
        price: 499,
        imageUrl: '/images/keychain.png',
        category: 'KEYCHAIN'
    },
    {
        id: '3',
        title: 'Luminous Glow Wallmoon',
        description: 'A breathtaking handcrafted glowing moon wall art decor piece. Softly illuminated from behind, this premium art piece transforms any room into a serene nightscape.',
        price: 4500,
        imageUrl: '/images/wallmoon.png',
        category: 'WALLMOON'
    },
    {
        id: '4',
        title: 'Crescent Thread Art Masterpiece',
        description: 'A highly detailed and beautiful handcrafted thread art geometric design of a crescent moon. Formed with gold and silver strings for an intricate artisan layout.',
        price: 2499,
        imageUrl: '/images/thread_art.png',
        category: 'THREAD_ART'
    }
];
