import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaLibSql({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const recipes = [
    {
      title: "Classic Margherita Pizza",
      description: "Simple, perfect pizza with San Marzano tomatoes, fresh mozzarella, and basil.",
      isPublic: true,
      forkCount: 0,
      ingredients: {
        create: [
          { name: "00 flour", quantity: "500", unit: "g", orderIndex: 0 },
          { name: "active dry yeast", quantity: "7", unit: "g", orderIndex: 1 },
          { name: "warm water", quantity: "325", unit: "ml", orderIndex: 2 },
          { name: "salt", quantity: "10", unit: "g", orderIndex: 3 },
          { name: "San Marzano tomatoes", quantity: "400", unit: "g", orderIndex: 4 },
          { name: "fresh mozzarella", quantity: "250", unit: "g", orderIndex: 5 },
          { name: "fresh basil leaves", quantity: "handful", unit: "", orderIndex: 6 },
          { name: "olive oil", quantity: "2", unit: "tbsp", orderIndex: 7 },
        ],
      },
      steps: {
        create: [
          {
            instruction: "Combine flour, yeast, water, and salt. Knead for 10 minutes until smooth and elastic.",
            timerSeconds: 600,
            orderIndex: 0,
          },
          {
            instruction: "Cover and let the dough rise in a warm spot for at least 1 hour, until doubled.",
            timerSeconds: 3600,
            orderIndex: 1,
          },
          {
            instruction: "Crush tomatoes by hand and season with salt and a drizzle of olive oil.",
            orderIndex: 2,
          },
          {
            instruction: "Preheat oven to its highest setting (ideally 250°C+) with a pizza stone or heavy baking sheet inside.",
            timerSeconds: 1800,
            orderIndex: 3,
          },
          {
            instruction: "Stretch dough into a thin round. Spread a thin layer of tomato sauce, tear over mozzarella.",
            orderIndex: 4,
          },
          {
            instruction: "Bake for 8–10 minutes until crust is charred at the edges and cheese is bubbling.",
            timerSeconds: 480,
            orderIndex: 5,
          },
          {
            instruction: "Remove from oven, scatter fresh basil, and finish with a drizzle of olive oil.",
            orderIndex: 6,
          },
        ],
      },
    },
    {
      title: "Brown Butter Chocolate Chip Cookies",
      description: "Browning the butter adds a nutty, caramel depth that makes these cookies impossible to stop eating.",
      isPublic: true,
      forkCount: 0,
      ingredients: {
        create: [
          { name: "unsalted butter", quantity: "225", unit: "g", orderIndex: 0 },
          { name: "light brown sugar", quantity: "200", unit: "g", orderIndex: 1 },
          { name: "granulated sugar", quantity: "100", unit: "g", orderIndex: 2 },
          { name: "eggs", quantity: "2", unit: "", orderIndex: 3 },
          { name: "vanilla extract", quantity: "2", unit: "tsp", orderIndex: 4 },
          { name: "all-purpose flour", quantity: "280", unit: "g", orderIndex: 5 },
          { name: "baking soda", quantity: "1", unit: "tsp", orderIndex: 6 },
          { name: "fine sea salt", quantity: "1", unit: "tsp", orderIndex: 7 },
          { name: "dark chocolate chips", quantity: "340", unit: "g", orderIndex: 8 },
          { name: "flaky sea salt", quantity: "", unit: "for topping", orderIndex: 9 },
        ],
      },
      steps: {
        create: [
          {
            instruction: "Melt butter in a saucepan over medium heat, stirring constantly. Continue cooking until foam subsides and butter turns golden brown with a nutty aroma. Pour into a large bowl and let cool 10 minutes.",
            timerSeconds: 600,
            orderIndex: 0,
          },
          {
            instruction: "Whisk both sugars into the cooled brown butter until combined. Add eggs and vanilla, whisk vigorously for 1 minute until thick and ribbony.",
            orderIndex: 1,
          },
          {
            instruction: "Fold in flour, baking soda, and salt until just combined. Stir in chocolate chips.",
            orderIndex: 2,
          },
          {
            instruction: "Chill the dough for at least 30 minutes (overnight is better).",
            timerSeconds: 1800,
            orderIndex: 3,
          },
          {
            instruction: "Preheat oven to 190°C. Scoop dough into balls and place on lined baking sheet, 5cm apart.",
            orderIndex: 4,
          },
          {
            instruction: "Bake 11–13 minutes until edges are set but centers look underdone. Sprinkle with flaky salt immediately.",
            timerSeconds: 720,
            orderIndex: 5,
          },
          {
            instruction: "Let cool on the pan for 5 minutes before moving — they firm up as they cool.",
            timerSeconds: 300,
            orderIndex: 6,
          },
        ],
      },
    },
    {
      title: "Simple Dal Tadka",
      description: "A comforting everyday dal finished with a tempered spice oil (tadka) that transforms the whole dish.",
      isPublic: true,
      forkCount: 0,
      ingredients: {
        create: [
          { name: "yellow lentils (moong or toor dal)", quantity: "250", unit: "g", orderIndex: 0 },
          { name: "water", quantity: "750", unit: "ml", orderIndex: 1 },
          { name: "turmeric", quantity: "0.5", unit: "tsp", orderIndex: 2 },
          { name: "salt", quantity: "", unit: "to taste", orderIndex: 3 },
          { name: "ghee or neutral oil", quantity: "3", unit: "tbsp", orderIndex: 4 },
          { name: "cumin seeds", quantity: "1", unit: "tsp", orderIndex: 5 },
          { name: "dried red chillies", quantity: "2", unit: "", orderIndex: 6 },
          { name: "garlic cloves, thinly sliced", quantity: "4", unit: "", orderIndex: 7 },
          { name: "onion, finely diced", quantity: "1", unit: "medium", orderIndex: 8 },
          { name: "tomatoes, chopped", quantity: "2", unit: "", orderIndex: 9 },
          { name: "garam masala", quantity: "0.5", unit: "tsp", orderIndex: 10 },
          { name: "fresh coriander", quantity: "", unit: "to finish", orderIndex: 11 },
        ],
      },
      steps: {
        create: [
          {
            instruction: "Rinse lentils until the water runs clear. Combine with water and turmeric in a pot. Bring to a boil, skimming any foam.",
            orderIndex: 0,
          },
          {
            instruction: "Reduce heat and simmer 20–25 minutes, stirring occasionally, until lentils are completely soft and creamy. Season with salt.",
            timerSeconds: 1500,
            orderIndex: 1,
          },
          {
            instruction: "Heat ghee in a small pan over medium-high until shimmering. Add cumin seeds and dried chillies — they should sizzle immediately.",
            orderIndex: 2,
          },
          {
            instruction: "Add garlic slices and fry 30 seconds until golden. Add onion and cook 5 minutes until softened.",
            timerSeconds: 330,
            orderIndex: 3,
          },
          {
            instruction: "Add tomatoes and cook down for 5 minutes until jammy. Stir in garam masala.",
            timerSeconds: 300,
            orderIndex: 4,
          },
          {
            instruction: "Pour the tadka over the cooked dal and stir through. Taste and adjust salt.",
            orderIndex: 5,
          },
          {
            instruction: "Finish with fresh coriander and serve with rice or flatbread.",
            orderIndex: 6,
          },
        ],
      },
    },
  ];

  for (const recipe of recipes) {
    await prisma.recipe.create({ data: recipe });
  }

  console.log("Seeded 3 sample recipes.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
