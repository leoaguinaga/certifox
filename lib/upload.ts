export interface UploadOptions {
  type: "cover" | "avatar";
  file: File;
}

export async function uploadFileToR2({
  type,
  file,
}: UploadOptions): Promise<{ publicUrl: string; fileKey: string }> {
  // Validación de tamaño en el cliente
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(
      `El archivo "${file.name}" supera el límite de 2 MB (${(file.size / 1024 / 1024).toFixed(2)} MB).`
    );
  }

  // Validación de tipo en el cliente
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error(
      `Formato "${file.type}" no permitido. Solo se aceptan imágenes JPEG, PNG o WEBP.`
    );
  }

  // 1. Obtener URL prefirmada
  const presignedRes = await fetch("/api/upload/presigned", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      mimeType: file.type,
      sizeBytes: file.size,
    }),
  });

  if (!presignedRes.ok) {
    const data = await presignedRes.json().catch(() => ({}));
    throw new Error(data.error || "No se pudo autorizar la subida del archivo.");
  }

  const { uploadUrl, fileKey, publicUrl } = await presignedRes.json();

  // 2. Subir directamente a Cloudflare R2 con PUT
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Error al transmitir los datos al almacenamiento R2.");
  }

  return { publicUrl, fileKey };
}
