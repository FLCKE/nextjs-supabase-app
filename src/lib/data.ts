export const restaurants = [
  {
    id: '1',
    name: 'The Golden Spoon',
    cuisine: 'Italian',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    menu: {
      appetizers: [
        { name: 'Bruschetta', description: 'Grilled bread with tomatoes, garlic, and olive oil', price: 8.99, image: 'https://images.unsplash.com/photo-1505253716362-af78f5d59f5f' },
        { name: 'Caprese Salad', description: 'Fresh mozzarella, tomatoes, and basil', price: 10.99, image: 'https://images.unsplash.com/photo-1579113800036-3b6b7b48a6d2' },
      ],
      mainCourses: [
        { name: 'Spaghetti Carbonara', description: 'Pasta with eggs, cheese, and pancetta', price: 16.99, image: 'https://images.unsplash.com/photo-1588013273468-31508b946d4d' },
        { name: 'Margherita Pizza', description: 'Pizza with tomato, mozzarella, and basil', price: 14.99, image: 'https://images.unsplash.com/photo-1598021680155-0b027a9d5d8b' },
      ],
      desserts: [
        { name: 'Tiramisu', description: 'Coffee-flavored Italian dessert', price: 7.99, image: 'https://images.unsplash.com/photo-1571115333913-263dc4c51799' },
        { name: 'Panna Cotta', description: 'Sweetened cream thickened with gelatin', price: 6.99, image: 'https://images.unsplash.com/photo-1542365639-1519319965b4' },
      ],
    },
  },
  {
    id: '2',
    name: 'El Pescador',
    cuisine: 'Seafood',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    menu: {
      appetizers: [
        { name: 'Ceviche', description: 'Fresh raw fish cured in citrus juices', price: 12.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Grilled Octopus', description: 'Tender octopus grilled to perfection', price: 14.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
      mainCourses: [
        { name: 'Paella', description: 'Spanish rice dish with seafood', price: 24.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Grilled Fish', description: 'Fresh fish of the day, grilled with herbs', price: 22.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
      desserts: [
        { name: 'Churros', description: 'Fried-dough pastry with chocolate sauce', price: 8.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Flan', description: 'Creamy caramel custard', price: 7.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
    },
  },
  {
    id: '3',
    name: 'Spice Route',
    cuisine: 'Indian',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    menu: {
      appetizers: [
        { name: 'Samosa', description: 'Crispy pastry with spiced potatoes and peas', price: 6.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Paneer Tikka', description: 'Grilled पनीर cubes marinated in spices', price: 11.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
      mainCourses: [
        { name: 'Butter Chicken', description: 'Creamy tomato-based curry with chicken', price: 18.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Lamb Rogan Josh', description: 'Slow-cooked lamb in a rich gravy', price: 20.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
      desserts: [
        { name: 'Gulab Jamun', description: 'Deep-fried milk solids in sugar syrup', price: 5.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Kulfi', description: 'Traditional Indian ice cream', price: 7.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
    },
  },
  {
    id: '4',
    name: 'Burger Haven',
    cuisine: 'American',
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1555396273-367ba0447a47',
    menu: {
      appetizers: [
        { name: 'Fries', description: 'Crispy golden fries', price: 4.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Onion Rings', description: 'Crispy onion rings with dipping sauce', price: 6.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
      mainCourses: [
        { name: 'Classic Burger', description: 'Beef patty, lettuce, tomato, onion, pickles', price: 12.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Bacon Cheeseburger', description: 'Classic burger with bacon and cheese', price: 14.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
      desserts: [
        { name: 'Milkshake', description: 'Thick and creamy milkshake', price: 7.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Brownie', description: 'Warm chocolate brownie with ice cream', price: 8.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
    },
  },
  {
    id: '5',
    name: 'Sushi Master',
    cuisine: 'Japanese',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1596468109500-ea20117a1c7c',
    menu: {
      appetizers: [
        { name: 'Edamame', description: 'Steamed soybeans with sea salt', price: 5.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Gyoza', description: 'Pan-fried pork dumplings', price: 8.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
      mainCourses: [
        { name: 'Sushi Platter', description: 'Assortment of fresh sushi and sashimi', price: 25.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Ramen', description: 'Noodle soup with pork belly and egg', price: 17.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
      desserts: [
        { name: 'Mochi Ice Cream', description: 'Japanese rice cake with ice cream filling', price: 6.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
        { name: 'Green Tea Ice Cream', description: 'Classic green tea flavored ice cream', price: 5.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' },
      ],
    },
  },
  // Add more restaurants here
];
