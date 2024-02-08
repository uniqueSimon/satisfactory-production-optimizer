export const generateCombinations = (lastCombination: number[]) => {
  const allCombinations: number[][] = [];

  const generateCombinationsRecursion = (currentCombination: number[] = []) => {
    if (currentCombination.length === lastCombination.length) {
      allCombinations.push(currentCombination);
      return;
    }
    const maxValueOfDigit = lastCombination[currentCombination.length];
    for (let digit = 0; digit < maxValueOfDigit; digit++) {
      generateCombinationsRecursion([...currentCombination, digit]);
    }
  };
  generateCombinationsRecursion();
  return allCombinations;
};
