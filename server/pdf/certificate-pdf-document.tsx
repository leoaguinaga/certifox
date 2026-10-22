/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#FFFDF9",
    fontFamily: "Helvetica",
    position: "relative",
  },
  borderOuter: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    borderWidth: 2,
    borderColor: "#FD761A",
    borderStyle: "solid",
  },
  borderInner: {
    position: "absolute",
    top: 22,
    left: 22,
    right: 22,
    bottom: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "solid",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    height: "100%",
    padding: 20,
    textAlign: "center",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D1C2F",
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 9,
    color: "#FD761A",
    fontWeight: "bold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  awardTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0D1C2F",
    marginTop: 18,
    letterSpacing: 1,
  },
  awardPreamble: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 8,
  },
  studentName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FD761A",
    marginTop: 10,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: "#FD761A",
    minWidth: 320,
  },
  documentNumber: {
    fontSize: 10,
    color: "#4B5563",
    marginTop: 6,
  },
  courseStatement: {
    fontSize: 11,
    color: "#374151",
    marginTop: 12,
    maxWidth: 500,
    lineHeight: 1.4,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D1C2F",
    marginTop: 6,
  },
  hoursBadge: {
    fontSize: 10,
    color: "#4B5563",
    marginTop: 4,
  },
  footer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  signatureBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 180,
  },
  signatureLine: {
    width: 140,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#111827",
  },
  signatureRole: {
    fontSize: 8,
    color: "#6B7280",
  },
  qrBlock: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qrImage: {
    width: 64,
    height: 64,
  },
  qrMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  codeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0D1C2F",
    fontFamily: "Courier",
  },
  sha256Text: {
    fontSize: 6,
    color: "#9CA3AF",
    fontFamily: "Courier",
    maxWidth: 160,
  },
  issuedDate: {
    fontSize: 8,
    color: "#6B7280",
  },
});

export interface CertificatePdfProps {
  code: string;
  studentName: string;
  documentType: string;
  documentNumber: string;
  courseTitle: string;
  hours: number;
  instructorName: string;
  institution: string;
  issuedAt: string;
  sha256: string;
  qrDataUrl: string;
}

export function CertificatePdfDocument({
  code,
  studentName,
  documentType,
  documentNumber,
  courseTitle,
  hours,
  instructorName,
  institution,
  issuedAt,
  sha256,
  qrDataUrl,
}: CertificatePdfProps) {
  return (
    <Document title={`Certificado Oficial ${code} - ${studentName}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.borderOuter} />
        <View style={styles.borderInner} />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brandTitle}>CERTIFOX ACADEMY</Text>
            <Text style={styles.brandSubtitle}>
              SISTEMA NACIONAL DE CERTIFICACIÓN Y ACREDITACIÓN TÉCNICA
            </Text>
          </View>

          {/* Main Title */}
          <View>
            <Text style={styles.awardTitle}>CERTIFICADO DE ACREDITACIÓN</Text>
            <Text style={styles.awardPreamble}>
              Se otorga la presente credencial oficial de suficiencia profesional y técnica a:
            </Text>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.documentNumber}>
              {documentType}: {documentNumber}
            </Text>
          </View>

          {/* Course Details */}
          <View>
            <Text style={styles.courseStatement}>
              Por haber completado satisfactoriamente los módulos teóricos y la evaluación práctica
              exigida por las normas técnicas del programa:
            </Text>
            <Text style={styles.courseTitle}>{courseTitle}</Text>
            <Text style={styles.hoursBadge}>
              Intensidad Académica: {hours} horas lectivas • Modalidad Virtual Auditada
            </Text>
          </View>

          {/* Footer: Signatures and QR Verification */}
          <View style={styles.footer}>
            {/* Signature */}
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{instructorName}</Text>
              <Text style={styles.signatureRole}>Docente Auditor e Instructor</Text>
              <Text style={styles.signatureRole}>{institution}</Text>
            </View>

            {/* Academic Direction */}
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>Dirección Académica</Text>
              <Text style={styles.signatureRole}>Certifox Technical Validation</Text>
              <Text style={styles.signatureRole}>Emisión: {issuedAt}</Text>
            </View>

            {/* QR Code and Cryptographic Verification (AC-07) */}
            <View style={styles.qrBlock}>
              {qrDataUrl ? <Image src={qrDataUrl} style={styles.qrImage} /> : null}
              <View style={styles.qrMeta}>
                <Text style={styles.codeText}>{code}</Text>
                <Text style={styles.issuedDate}>Escaneo QR público oficial</Text>
                <Text style={styles.sha256Text}>SHA: {sha256.slice(0, 32)}...</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
