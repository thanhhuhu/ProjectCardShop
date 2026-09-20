import type { Product } from "../types/product";

import TrickstarAquaAngel from "../images/products/TrickstarAquaAngel.jpg";
import TrickstarBellaMadonna from "../images/products/TrickstarBellaMadonna.jpg";
import TrickstarBlackCatbat from "../images/products/TrickstarBlackCatbat.jpg";
import TrickstarCadina from "../images/products/TrickstarCadina.jpg";
import TrickstarColchica from "../images/products/TrickstarColchica.jpg";
import TrickstarCorobane from "../images/products/TrickstarCorobane.jpg";
import TrickstarDivaridis from "../images/products/TrickstarDivardis.jpg";
import TrickstarHolyAngel from "../images/products/TrickstarHolyAngel.jpg";
import TrickstarHolyAngel2 from "../images/products/TrickstarHolyAngel2.jpg";
import TrickstarHoody from "../images/products/TrickstarHoody.jpg";
import TrickstarLightStage from "../images/products/TrickstarLightStage.jpg";
import TrickstarLilybell from "../images/products/TrickstarLilybell.jpg";
import TrickstarLiveStage from "../images/products/TrickstarLiveStage.jpg";
import TrickstarLycoris from "../images/products/TrickstarLycoris.jpg";
import TrickstarNobleAngel from "../images/products/TrickstarNobleAngel.jpg";
import TrickstarReincarnation from "../images/products/TrickstarReincarnation.jpg";

const items: Omit<Product, "id">[] = [
    {
        code: "MAMO-EN093",
        name: "Trickstar Lilybell",
        rarity: "Ultra Rare",
        price: 25000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarLilybell,
        game: "ygo",
    },
    {
        code: "MAMO-EN094",
        name: "Trickstar Holly Angel",
        rarity: "Ultra Rare",
        price: 45000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarHolyAngel,
        game: "ygo",
    },
    {
        code: "MAMO-EN095",
        name: "Trickstar Divaridis",
        rarity: "Ultra Rare",
        price: 30000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarDivaridis,
        game: "ygo",
    },
    {
        code: "MAMO-EN096",
        name: "Trickstar Bella Madonna",
        rarity: "Ultra Rare",
        price: 55000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarBellaMadonna,
        game: "ygo",
    },
    {
        code: "MAMO-EN097",
        name: "Trickstar Black Catbat",
        rarity: "Super Rare",
        price: 20000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarBlackCatbat,
        game: "ygo",
    },
    {
        code: "MAMO-EN098",
        name: "Trickstar Holly Angel 2",
        rarity: "Rare",
        price: 18000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarHolyAngel2,
        game: "ygo",
    },
    {
        code: "MAMO-EN099",
        name: "Trickstar Noble Angel",
        rarity: "Ultra Rare",
        price: 60000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarNobleAngel,
        game: "ygo",
    },
    {
        code: "MAMO-EN100",
        name: "Trickstar Colchica",
        rarity: "Super Rare",
        price: 35000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarColchica,
        game: "ygo",
    },
    {
        code: "MAMO-EN101",
        name: "Trickstar Reincarnation",
        rarity: "Secret Rare",
        price: 75000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarReincarnation,
        game: "ygo",
    },
    {
        code: "MAMO-EN102",
        name: "Trickstar Live Stage",
        rarity: "Ultra Rare",
        price: 50000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarLiveStage,
        game: "ygo",
    },
    {
        code: "MAMO-EN103",
        name: "Trickstar Hoody",
        rarity: "Super Rare",
        price: 28000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarHoody,
        game: "ygo",
    },
    {
        code: "MAMO-EN104",
        name: "Trickstar Light Stage",
        rarity: "Ultra Rare",
        price: 40000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarLightStage,
        game: "ygo",
    },
    {
        code: "MAMO-EN105",
        name: "Trickstar Corobane",
        rarity: "Super Rare",
        price: 32000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarCorobane,
        game: "ygo",
    },
    {
        code: "MAMO-EN106",
        name: "Trickstar Aqua Angel",
        rarity: "Ultra Rare",
        price: 42000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarAquaAngel,
        game: "ygo",
    },
    {
        code: "MAMO-EN107",
        name: "Trickstar Cadina",
        rarity: "Ultra Rare",
        price: 30000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarCadina,
        game: "ygo",
    },
    {
        code: "MAMO-EN108",
        name: "Trickstar Lycoris",
        rarity: "Ultra Rare",
        price: 65000,
        stock: Math.floor(Math.random() * 5) + 1,
        imageUrl: TrickstarLycoris,
        game: "ygo",
    },
];

// Tự động tạo id: 1, 2, 3, ...
export const products: Product[] = items.map((item, index) => ({
    ...item,
    id: index + 1,
}));