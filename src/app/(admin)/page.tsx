import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import TaskCard from "@/components/cards/Dashboard/TaskCard";
import useProfile from "@/hooks/profile/useProfile";
import IndexPage from "@/components/index/indexPage";

export const metadata: Metadata = {
  title:
    "UPTALib",
  description: "Esta es la página de administración de UPTALib",
};

export default async function Ecommerce() {

  return (
    <IndexPage />
  )
}
