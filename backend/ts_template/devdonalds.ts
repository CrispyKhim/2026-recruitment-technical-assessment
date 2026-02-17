import express, { Request, Response } from "express";
import { resourceLimits } from "worker_threads";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
// Changed any to any[] and null to []; const cookbook: any = null;
const cookbook: any[] = [];

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  // TODO: implement me
 
  // 1: Return null if the string is empty
  if (recipeName.length === 0) {
    return null;
  }

  // 2: Replace hyphens and underscores with whitespace
  recipeName = recipeName.replace(/[-_]+/g, ' ');

  // 3: Contain only letters and whitespace; remove any other characters
  recipeName = recipeName.replace(/[^a-zA-Z\s]/g, '');

  // 4: Capitalise the first letter of each word
  const array = recipeName.split(' ');
  recipeName = array.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  // 5: Only one whitespace between words
  recipeName = recipeName.replace(/\s+/g, ' ').trim();

  // Return the result
  return recipeName;
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  // TODO: implement me

  const entry = req.body;

  // 1: Type can only be "recipe" or "ingredient"
  if (entry.type !== "recipe" && entry.type !== "ingredient") {
    return res.status(400).json({ error: "Invalid entry type" });
  }

  // 2: cookTime must be greater than or equal to 0
  if (entry.type === "ingredient" && entry.cookTime < 0) {
    return res.status(400).json({ error: "Invalid cookTime" });
  }

  // 3: Name must be unique
  if (cookbook.some(element => element.name === entry.name)) {
    return res.status(400).json({ error: "Invalid entry name" });
  }

  // 4: RequiredItems can only have one element per name
  if (entry.type === "recipe" && entry.requiredItems.length > 1) {
    return res.status(400).json({ error: "Invalid entry requiredItems" });
  }

  // Add the entry to the cookbook
  cookbook.push(entry);
  res.status(200).json({});
});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  const name = req.query.name as string | undefined;
  if (!name) {
    return res.status(400).json({ error: "Recipe not found" });
  }

  // Obtain the one entry with the corresponding name
  const entry = cookbook.find((element: any) => element?.name === name);

  // 1: A recipe with the corresponding name cannot be found
  if (!entry) {
    return res.status(400).json({ error: "Recipe not found" });
  }

  // 2: The searched name is NOT a recipe name (ie. an ingredient)
  if (entry.type === "ingredient") {
    return res.status(400).json({ error: "Searched name is not a recipe name" });
  }

  let result = [];
  let totalCookTime = 0;
    
  // Recursive function
  const getToBaseIngredients = (name: string, quantity: number) => {
    let input = cookbook.find(element => element.name === name);
    if (input === undefined) {
      // 3: The recipe contains recipes or ingredients that aren't in the cookbook
      return res.status(400).json({ error: "Recipe contains ingredients that aren't in the cookbook" });
    } else if (input.type === 'ingredient') {
      // Sum the total cook time
      totalCookTime = totalCookTime + input.cookTime;
      
      // Save ingredient object to result array
      result.push({
        name: input.name, 
        quantity: quantity
      })
    } else if (input.type === 'recipe') {
      // Map through each ingredient of recipe; multiplying quantity
      input.requiredItems.map(item => {
        getToBaseIngredients(item.name, item.quantity * quantity);
      })
    }
  }

  // Call the first entry to the recursive function
  getToBaseIngredients(entry.name, 1);

  // Return result in specified format from README
  res.status(200).json({
    name: entry.name,
    cookTime: totalCookTime,
    ingredients: result
  });
});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
