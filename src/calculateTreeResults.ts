import { Recipe } from "./App";

export const calculateTreeResults = (
  productToProduce: string,
  wantedOutputRate: number,
  selectedRecipes: string[],
  availableRecipes: Recipe[]
) => {
  const machines = new Map<string, number>();
  const productRates = new Map<
    string,
    { rate: number; type?: "RESOURCE" | "MULTIPLE" }
  >();
  const recursion = (product: string, rate: number) => {
    const recipe = availableRecipes.find(
      (x) =>
        x.product.name === product && selectedRecipes.includes(x.recipeName)
    );
    const existingProd = productRates.get(product);
    existingProd
      ? productRates.set(product, {
          rate: existingProd.rate + rate,
          type: recipe ? "MULTIPLE" : "RESOURCE",
        })
      : productRates.set(product, {
          rate,
          type: recipe ? undefined : "RESOURCE",
        });
    if (recipe) {
      const numberOfMachines =
        rate / ((recipe.product.amount / recipe.time) * 60);
      recipe.producedIn;
      const existingMachine = machines.get(recipe.producedIn);
      machines.set(
        recipe.producedIn,
        existingMachine ? existingMachine + numberOfMachines : numberOfMachines
      );

      for (const ingredient of recipe.ingredients) {
        const ingredientRate =
          (ingredient.amount / recipe.product.amount) * rate;
        recursion(ingredient.name, ingredientRate);
      }
    }
  };
  recursion(productToProduce, wantedOutputRate);

  return { machines, productRates };
};
