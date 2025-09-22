"use client"
import { useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import idl from "./idl.json";
import { AnchorProgram } from "./ts-idl";

export const useProgram = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    return useMemo(() => {
        if (!wallet) return null;

        const provider = new AnchorProvider(connection, wallet, {
            preflightCommitment: "processed",
        });

        setProvider(provider);

        return new Program(idl as AnchorProgram, provider);
    }, [connection, wallet]);
};
