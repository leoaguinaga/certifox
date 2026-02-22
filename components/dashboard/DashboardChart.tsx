"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
    valid: {
        label: "Vigentes",
        color: "hsl(var(--success))",
    },
    warning: {
        label: "Por Vencer",
        color: "hsl(var(--warning))",
    },
    expired: {
        label: "Vencidos",
        color: "hsl(var(--danger))",
    },
} satisfies ChartConfig;

interface DashboardChartProps {
    validCount: number;
    warningCount: number;
    expiredCount: number;
}

export function DashboardChart({ validCount, warningCount, expiredCount }: DashboardChartProps) {
    const data = [
        { name: "Vigentes", value: validCount, fill: "var(--color-valid)" },
        { name: "Por Vencer", value: warningCount, fill: "var(--color-warning)" },
        { name: "Vencidos", value: expiredCount, fill: "var(--color-expired)" },
    ].filter(item => item.value > 0);

    if (data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                No hay certificados registrados aún.
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
