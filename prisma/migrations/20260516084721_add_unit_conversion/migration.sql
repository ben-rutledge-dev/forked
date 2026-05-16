-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('ML', 'L', 'TSP', 'TBSP', 'FL_OZ', 'CUP', 'PT', 'QT', 'GAL', 'G', 'KG', 'OZ', 'LB');

-- AlterTable: convert quantity TEXT → DOUBLE PRECISION, preserving numeric values and nulling non-numeric strings
ALTER TABLE "Ingredient"
  ALTER COLUMN "quantity" TYPE DOUBLE PRECISION
    USING CASE
      WHEN "quantity" ~ '^[0-9]+(\.[0-9]+)?$' THEN "quantity"::DOUBLE PRECISION
      ELSE NULL
    END,
  ADD COLUMN "unitKey" "UnitType";
