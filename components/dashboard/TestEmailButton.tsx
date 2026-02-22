"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { sendTestEmailAction } from "@/app/actions/alerts";
import { toast } from "sonner";

export function TestEmailButton({ companySlug }: { companySlug: string }) {
    const [loading, setLoading] = useState(false);

    const handleSendTestEmail = async () => {
        setLoading(true);
        const res = await sendTestEmailAction(companySlug);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(res.message);
        }
    };

    return (
        <Button onClick={handleSendTestEmail} disabled={loading} variant="default">
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Send className="mr-2 h-4 w-4" />
            )}
            Enviar correo de prueba
        </Button>
    );
}
