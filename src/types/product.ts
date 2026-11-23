export interface Product {
    id: number;
    code: string; // Mã thẻ, ví dụ MAMO-EN035
    name: string;
    archetype: string; // Tộc hệ, vd Trickstar
    rarity: string; // Secret Rare, Ultra Rare, Common...
    price: number; // VND
    stock: number;
    imageUrl: string;
    game: string; // ygo, pokemon, digimon...
}