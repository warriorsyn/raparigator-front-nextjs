"use client";

import { Button } from "./button";
import { Modal } from "./modal";

interface RiskWarningModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetLabel: string;
}

export function RiskWarningModal({ open, onClose, onConfirm, targetLabel }: RiskWarningModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Aviso de seguranca"
      description={`Ao abrir ${targetLabel}, voce sai do ambiente monitorado da Sigillus.`}
      actions={
        <>
          <Button variant="secondary" fullWidth onClick={onClose}>
            Continuar na Sigillus
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm}>
            Entendi, sair da plataforma
          </Button>
        </>
      }
    >
      <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">
        Isso pode reduzir rastreabilidade, suporte e cobertura de seguranca da plataforma.
      </div>
    </Modal>
  );
}
