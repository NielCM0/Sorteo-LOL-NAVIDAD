
import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://befhrgrmhbnyevqaxfwd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_i53EcT-pDCvDXaHO1biifQ_KibI8_dr';

export type Status = 'registro' | 'sorteando' | 'sorteado';
export interface RoomInfo { name: string; reveal_date: string; status: Status; size: number; count: number; }
export interface AdminData { name: string; reveal_date: string; status: Status; size: number;
  participants: { nickname: string; riot_id: string; email: string }[]; }
export interface GiftData { g: string; t: string; r: string; d: string; s: string; }

export const RIOT_REGEX = /^.{3,16}#[A-Za-z0-9]{3,5}$/;
export const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function daysLeft(date: string): number {
  return Math.max(0, Math.ceil((new Date(date + 'T00:00:00').getTime() - Date.now()) / 86400000));
}

export function decodeGift(data: string): GiftData | null {
  try {
    const b64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const o = JSON.parse(new TextDecoder().decode(bytes));
    return o && o.g && o.t && o.r ? (o as GiftData) : null;
  } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class Api {
  private sb = createClient(SUPABASE_URL, SUPABASE_KEY);

  private async rpc<T>(fn: string, args: object): Promise<T> {
    const { data, error } = await this.sb.rpc(fn, args);
    if (error) throw new Error(error.message);
    return data as T;
  }

  createRoom(name: string, reveal: string, size: number) {
    return this.rpc<{ room_id: string; admin_token: string }>('create_room', { p_name: name, p_reveal: reveal, p_size: size });
  }
  roomInfo(id: string) { return this.rpc<RoomInfo | null>('room_info', { p_room: id }); }
  join(id: string, nick: string, riot: string, email: string) {
    return this.rpc<{ ok: boolean }>('join_room', { p_room: id, p_nick: nick, p_riot: riot, p_email: email });
  }
  adminPanel(id: string, token: string) { return this.rpc<AdminData>('admin_panel', { p_room: id, p_token: token }); }

  async runDraw(id: string, token: string) {
    const site_url = location.origin + location.pathname;
    const { data, error } = await this.sb.functions.invoke('draw', {
      body: { room_id: id, admin_token: token, site_url },
    });
    if (error) {
      let msg = error.message;
      try { msg = (await (error as any).context.json()).error ?? msg; } catch { /* sin detalle */ }
      throw new Error(msg);
    }
    return data as { ok: boolean; sent: number };
  }
}