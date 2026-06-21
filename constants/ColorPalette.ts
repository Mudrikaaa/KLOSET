export interface ColorSwatch {
  name: string;       // Display name: "Dusty Rose"
  hex: string;        // Visual representation: "#DCAE96"
  family: string;     // Grouping: "Pinks & Roses"
  undertone: 'warm' | 'cool' | 'neutral';  // For matching logic
}

export const COLOR_PALETTE: ColorSwatch[] = [
  // Whites & Creams
  { name: 'White', hex: '#FFFFFF', family: 'Whites & Neutrals', undertone: 'neutral' },
  { name: 'Off-White', hex: '#FAF0E6', family: 'Whites & Neutrals', undertone: 'warm' },
  { name: 'Ivory', hex: '#FFFFF0', family: 'Whites & Neutrals', undertone: 'warm' },
  { name: 'Cream', hex: '#FFFDD0', family: 'Whites & Neutrals', undertone: 'warm' },

  // Beiges & Tans
  { name: 'Beige', hex: '#F5F5DC', family: 'Beiges & Tans', undertone: 'warm' },
  { name: 'Sand', hex: '#C2B280', family: 'Beiges & Tans', undertone: 'warm' },
  { name: 'Taupe', hex: '#483C32', family: 'Beiges & Tans', undertone: 'neutral' },
  { name: 'Camel', hex: '#C19A6B', family: 'Beiges & Tans', undertone: 'warm' },
  { name: 'Khaki', hex: '#BDB76B', family: 'Beiges & Tans', undertone: 'warm' },

  // Browns
  { name: 'Brown', hex: '#A52A2A', family: 'Browns', undertone: 'warm' },
  { name: 'Chocolate', hex: '#7B3F00', family: 'Browns', undertone: 'warm' },
  { name: 'Coffee', hex: '#6F4E37', family: 'Browns', undertone: 'warm' },
  { name: 'Tan', hex: '#D2B48C', family: 'Browns', undertone: 'warm' },

  // Greys & Charcoals
  { name: 'Light Grey', hex: '#D3D3D3', family: 'Greys', undertone: 'cool' },
  { name: 'Grey', hex: '#808080', family: 'Greys', undertone: 'neutral' },
  { name: 'Charcoal', hex: '#36454F', family: 'Greys', undertone: 'cool' },
  { name: 'Slate', hex: '#708090', family: 'Greys', undertone: 'cool' },

  // Blacks
  { name: 'Black', hex: '#000000', family: 'Black', undertone: 'neutral' },

  // Reds
  { name: 'Red', hex: '#FF0000', family: 'Reds', undertone: 'neutral' },
  { name: 'Crimson', hex: '#DC143C', family: 'Reds', undertone: 'cool' },
  { name: 'Scarlet', hex: '#FF2400', family: 'Reds', undertone: 'warm' },
  { name: 'Maroon', hex: '#800000', family: 'Reds', undertone: 'warm' },
  { name: 'Burgundy', hex: '#800020', family: 'Reds', undertone: 'cool' },
  { name: 'Wine', hex: '#722F37', family: 'Reds', undertone: 'cool' },

  // Pinks & Roses
  { name: 'Pink', hex: '#FFC0CB', family: 'Pinks & Roses', undertone: 'cool' },
  { name: 'Blush', hex: '#DE5D83', family: 'Pinks & Roses', undertone: 'warm' },
  { name: 'Dusty Rose', hex: '#DCAE96', family: 'Pinks & Roses', undertone: 'warm' },
  { name: 'Hot Pink', hex: '#FF69B4', family: 'Pinks & Roses', undertone: 'cool' },
  { name: 'Magenta', hex: '#FF00FF', family: 'Pinks & Roses', undertone: 'cool' },
  { name: 'Coral', hex: '#FF7F50', family: 'Pinks & Roses', undertone: 'warm' },
  { name: 'Salmon', hex: '#FA8072', family: 'Pinks & Roses', undertone: 'warm' },
  { name: 'Peach', hex: '#FFDAB9', family: 'Pinks & Roses', undertone: 'warm' },
  { name: 'Rose Gold', hex: '#B76E79', family: 'Pinks & Roses', undertone: 'warm' },

  // Oranges
  { name: 'Orange', hex: '#FFA500', family: 'Oranges', undertone: 'warm' },
  { name: 'Rust', hex: '#B7410E', family: 'Oranges', undertone: 'warm' },
  { name: 'Burnt Orange', hex: '#CC5500', family: 'Oranges', undertone: 'warm' },
  { name: 'Terracotta', hex: '#E2725B', family: 'Oranges', undertone: 'warm' },
  { name: 'Tangerine', hex: '#FF9966', family: 'Oranges', undertone: 'warm' },

  // Yellows
  { name: 'Yellow', hex: '#FFD700', family: 'Yellows', undertone: 'warm' },
  { name: 'Mustard', hex: '#FFDB58', family: 'Yellows', undertone: 'warm' },
  { name: 'Lemon', hex: '#FFF44F', family: 'Yellows', undertone: 'cool' },
  { name: 'Turmeric', hex: '#E3A857', family: 'Yellows', undertone: 'warm' },
  { name: 'Gold', hex: '#FFD700', family: 'Yellows', undertone: 'warm' },

  // Greens
  { name: 'Green', hex: '#008000', family: 'Greens', undertone: 'neutral' },
  { name: 'Emerald', hex: '#50C878', family: 'Greens', undertone: 'cool' },
  { name: 'Sage', hex: '#BCB88A', family: 'Greens', undertone: 'warm' },
  { name: 'Olive', hex: '#808000', family: 'Greens', undertone: 'warm' },
  { name: 'Mint', hex: '#98FF98', family: 'Greens', undertone: 'cool' },
  { name: 'Teal', hex: '#008080', family: 'Greens', undertone: 'cool' },
  { name: 'Forest Green', hex: '#228B22', family: 'Greens', undertone: 'warm' },
  { name: 'Bottle Green', hex: '#006A4E', family: 'Greens', undertone: 'cool' },
  { name: 'Pistachio', hex: '#93C572', family: 'Greens', undertone: 'warm' },

  // Blues
  { name: 'Light Blue', hex: '#ADD8E6', family: 'Blues', undertone: 'cool' },
  { name: 'Sky Blue', hex: '#87CEEB', family: 'Blues', undertone: 'cool' },
  { name: 'Blue', hex: '#0000FF', family: 'Blues', undertone: 'cool' },
  { name: 'Cobalt', hex: '#0047AB', family: 'Blues', undertone: 'cool' },
  { name: 'Royal Blue', hex: '#4169E1', family: 'Blues', undertone: 'cool' },
  { name: 'Navy', hex: '#000080', family: 'Blues', undertone: 'cool' },
  { name: 'Indigo', hex: '#4B0082', family: 'Blues', undertone: 'cool' },
  { name: 'Denim Blue', hex: '#1560BD', family: 'Blues', undertone: 'cool' },
  { name: 'Powder Blue', hex: '#B0E0E6', family: 'Blues', undertone: 'cool' },
  { name: 'Ice Blue', hex: '#99C5C4', family: 'Blues', undertone: 'cool' },

  // Purples & Lavenders
  { name: 'Lavender', hex: '#E6E6FA', family: 'Purples', undertone: 'cool' },
  { name: 'Lilac', hex: '#C8A2C8', family: 'Purples', undertone: 'cool' },
  { name: 'Purple', hex: '#800080', family: 'Purples', undertone: 'cool' },
  { name: 'Plum', hex: '#673147', family: 'Purples', undertone: 'cool' },
  { name: 'Mauve', hex: '#E0B0FF', family: 'Purples', undertone: 'cool' },
  { name: 'Aubergine', hex: '#3B0910', family: 'Purples', undertone: 'cool' },
  { name: 'Violet', hex: '#7F00FF', family: 'Purples', undertone: 'cool' },

  // Metallics
  { name: 'Silver', hex: '#C0C0C0', family: 'Metallics', undertone: 'cool' },
  { name: 'Gold (Metallic)', hex: '#D4AF37', family: 'Metallics', undertone: 'warm' },
  { name: 'Copper', hex: '#B87333', family: 'Metallics', undertone: 'warm' },
  { name: 'Bronze', hex: '#CD7F32', family: 'Metallics', undertone: 'warm' },

  // Multi / Prints
  { name: 'Multi-color', hex: '#RAINBOW', family: 'Special', undertone: 'neutral' },
];
