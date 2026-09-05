import Link from "next/link";
import Image from "next/image";
import { readActiveFrontendSolutions } from "@/app/admin/solutions/solutionStore";
import { SolutionsGridClient } from "./SolutionsGridClient";

export async function SolutionsGrid({ page }: { page?: number }) {
  const activeSolutions = await readActiveFrontendSolutions();

  return <SolutionsGridClient solutions={activeSolutions} />;
}
