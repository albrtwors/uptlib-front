import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import TaskCard from "@/components/cards/Dashboard/TaskCard";

export const metadata: Metadata = {
  title:
    "UPTALib",
  description: "Esta es la página de administración de UPTALib",
};

export default function Ecommerce() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-bold">Dashboard</h1>


      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <TaskCard title='Gestiona Libros' description="Administra los libros de la aplicacion ..." icon="📚" />
          <TaskCard title='Inventario' description="Administra el inventario de la biblioteca ..." icon="📦" />
          <TaskCard title='Prestamos' description="Administra el inventario de la biblioteca ..." icon="📦" />
        </div>
      </div>


    </div>
  );
}
