'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import {
  useEnterprise,
  useSabreStatus,
  useUpdateEnterprise,
  useUpdateCredentials
} from '@/hooks/useEnterprises'
import type { ApiVersion, CredentialsUpdate, Enterprise, MaskedSecret } from '@/lib/api/enterprises'
import { Badge, Button, Card, CardHeader, Field, Input, Segmented, Spinner } from '@/components/ui'

const VERSIONS: { value: ApiVersion; label: string }[] = [
  { value: 'v1.0', label: 'v1.0' },
  { value: 'v2.0', label: 'v2.0' }
]

function Masked({ secret }: { secret: MaskedSecret }) {
  return secret.set ? (
    <span className="font-mono text-stone-700">{secret.hint}</span>
  ) : (
    <span className="text-stone-400">not set</span>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="text-stone-800">{children}</span>
    </div>
  )
}

// ---- Settings (name + FE-routing version flags) ------------------------------

function SettingsCard({ ent }: { ent: Enterprise }) {
  const update = useUpdateEnterprise(ent.id)
  const [name, setName] = useState(ent.name ?? '')
  const [search, setSearch] = useState<ApiVersion>((ent.searchApiVersion as ApiVersion) ?? 'v1.0')
  const [booking, setBooking] = useState<ApiVersion>((ent.bookingApiVersion as ApiVersion) ?? 'v1.0')

  const dirty =
    name !== (ent.name ?? '') || search !== ent.searchApiVersion || booking !== ent.bookingApiVersion

  return (
    <Card>
      <CardHeader title="Settings" description="Name and the FE-routing API version flags" />
      <div className="space-y-4 p-5">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-600">Search API version</span>
          <Segmented value={search} options={VERSIONS} onChange={setSearch} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-600">Booking API version</span>
          <Segmented value={booking} options={VERSIONS} onChange={setBooking} />
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Button
            disabled={!dirty || update.isPending}
            onClick={() => update.mutate({ name, searchApiVersion: search, bookingApiVersion: booking })}
          >
            {update.isPending ? 'Saving…' : 'Save changes'}
          </Button>
          {update.isSuccess && !dirty && <span className="text-xs text-emerald-600">Saved</span>}
          {update.isError && <span className="text-xs text-red-600">{(update.error as Error).message}</span>}
        </div>
      </div>
    </Card>
  )
}

// ---- Sabre credentials (masked view + write-only editor) ---------------------

function SabreCard({ ent }: { ent: Enterprise }) {
  const s = ent.credentials.sabre
  const update = useUpdateCredentials(ent.id)
  const [editing, setEditing] = useState(false)
  const [f, setF] = useState({ clientId: '', clientSecret: '', username: '', password: '', pseudoCityCode: '', rateCodes: '' })

  function save() {
    const sabre: NonNullable<CredentialsUpdate['sabre']> = {}
    if (f.clientId) sabre.clientId = f.clientId
    if (f.clientSecret) sabre.clientSecret = f.clientSecret
    if (f.username) sabre.username = f.username
    if (f.password) sabre.password = f.password
    if (f.pseudoCityCode) sabre.pseudoCityCode = f.pseudoCityCode
    if (f.rateCodes.trim()) sabre.rateCodes = f.rateCodes.split(',').map((c) => c.trim()).filter(Boolean)
    if (Object.keys(sabre).length === 0) return
    update.mutate(
      { sabre },
      {
        onSuccess: () => {
          setEditing(false)
          setF({ clientId: '', clientSecret: '', username: '', password: '', pseudoCityCode: '', rateCodes: '' })
        }
      }
    )
  }

  return (
    <Card>
      <CardHeader
        title="Sabre credentials"
        description="Write-only — secrets are never returned, only presence + a last-4 hint"
        action={
          <div className="flex items-center gap-2">
            <Badge tone={s.configured ? 'green' : 'gray'}>{s.configured ? 'configured' : 'incomplete'}</Badge>
            <Button size="sm" variant="secondary" onClick={() => setEditing((e) => !e)}>
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        }
      />
      <div className="p-5">
        <div className="divide-y divide-stone-100">
          <Row label="Client ID"><Masked secret={s.clientId} /></Row>
          <Row label="Client secret"><Masked secret={s.clientSecret} /></Row>
          <Row label="Username">{s.username ?? <span className="text-stone-400">not set</span>}</Row>
          <Row label="Password"><Masked secret={s.password} /></Row>
          <Row label="Pseudo city code">{s.pseudoCityCode ?? <span className="text-stone-400">not set</span>}</Row>
          <Row label="Rate codes">
            {s.rateCodes?.length ? (
              <span className="font-mono text-xs text-stone-600">{s.rateCodes.join(', ')}</span>
            ) : (
              <span className="text-stone-400">none</span>
            )}
          </Row>
          <Row label="Session token">
            {s.session.hasToken ? (
              <Badge tone="blue">cached{s.session.expiresAt ? ` · exp ${new Date(s.session.expiresAt).toLocaleDateString()}` : ''}</Badge>
            ) : (
              <span className="text-stone-400">none</span>
            )}
          </Row>
        </div>

        {editing && (
          <div className="mt-4 space-y-3 rounded-lg bg-stone-50 p-4">
            <p className="text-xs text-stone-500">Leave a field blank to keep its current value. Filled fields are written.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Client ID"><Input value={f.clientId} onChange={(e) => setF({ ...f, clientId: e.target.value })} /></Field>
              <Field label="Client secret"><Input type="password" value={f.clientSecret} onChange={(e) => setF({ ...f, clientSecret: e.target.value })} /></Field>
              <Field label="Username"><Input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} placeholder="EPR-PCC-AA" /></Field>
              <Field label="Password"><Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
              <Field label="Pseudo city code"><Input value={f.pseudoCityCode} onChange={(e) => setF({ ...f, pseudoCityCode: e.target.value })} /></Field>
              <Field label="Rate codes (comma-separated)"><Input value={f.rateCodes} onChange={(e) => setF({ ...f, rateCodes: e.target.value })} placeholder="API, VMC, STP" /></Field>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={save} disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save credentials'}</Button>
              {update.isError && <span className="text-xs text-red-600">{(update.error as Error).message}</span>}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ---- Zentrumhub credentials --------------------------------------------------

function ZentrumhubCard({ ent }: { ent: Enterprise }) {
  const z = ent.credentials.zentrumhub
  const update = useUpdateCredentials(ent.id)
  const [editing, setEditing] = useState(false)
  const [f, setF] = useState({ apiKey: '', accountId: '', channelId: '' })

  function save() {
    const zentrumhub: NonNullable<CredentialsUpdate['zentrumhub']> = {}
    if (f.apiKey) zentrumhub.apiKey = f.apiKey
    if (f.accountId) zentrumhub.accountId = f.accountId
    if (f.channelId) zentrumhub.channelId = f.channelId
    if (Object.keys(zentrumhub).length === 0) return
    update.mutate({ zentrumhub }, { onSuccess: () => { setEditing(false); setF({ apiKey: '', accountId: '', channelId: '' }) } })
  }

  return (
    <Card>
      <CardHeader
        title="Zentrumhub credentials"
        action={
          <div className="flex items-center gap-2">
            <Badge tone={z.configured ? 'green' : 'gray'}>{z.configured ? 'configured' : 'incomplete'}</Badge>
            <Button size="sm" variant="secondary" onClick={() => setEditing((e) => !e)}>{editing ? 'Cancel' : 'Edit'}</Button>
          </div>
        }
      />
      <div className="p-5">
        <div className="divide-y divide-stone-100">
          <Row label="API key"><Masked secret={z.apiKey} /></Row>
          <Row label="Account ID">{z.accountId ?? <span className="text-stone-400">not set</span>}</Row>
          <Row label="Channel ID">{z.channelId ?? <span className="text-stone-400">not set</span>}</Row>
        </div>
        {editing && (
          <div className="mt-4 space-y-3 rounded-lg bg-stone-50 p-4">
            <p className="text-xs text-stone-500">Leave blank to keep current. Filled fields are written.</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="API key"><Input type="password" value={f.apiKey} onChange={(e) => setF({ ...f, apiKey: e.target.value })} /></Field>
              <Field label="Account ID"><Input value={f.accountId} onChange={(e) => setF({ ...f, accountId: e.target.value })} /></Field>
              <Field label="Channel ID"><Input value={f.channelId} onChange={(e) => setF({ ...f, channelId: e.target.value })} /></Field>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={save} disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save credentials'}</Button>
              {update.isError && <span className="text-xs text-red-600">{(update.error as Error).message}</span>}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ---- Sabre integration status ------------------------------------------------

function SabreStatusCard({ id }: { id: string }) {
  const { data, isLoading } = useSabreStatus(id)
  return (
    <Card>
      <CardHeader title="Sabre status" description="Read-only integration health" />
      <div className="p-5">
        {isLoading || !data ? (
          <div className="flex items-center gap-2 py-2 text-sm text-stone-500"><Spinner /> Loading…</div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-stone-50 p-4">
              <div className="text-2xl font-semibold text-stone-900">{data.hotels.links.toLocaleString()}</div>
              <div className="text-xs text-stone-500">hotel links</div>
            </div>
            <div className="rounded-lg bg-stone-50 p-4">
              <div className="text-2xl font-semibold text-stone-900">{data.hotels.sabreEligible.toLocaleString()}</div>
              <div className="text-xs text-stone-500">Sabre-eligible</div>
            </div>
            <div className="rounded-lg bg-stone-50 p-4">
              <div className="text-2xl font-semibold text-stone-900">{data.hotels.alreadyProbed.toLocaleString()}</div>
              <div className="text-xs text-stone-500">rate-codes probed</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function EnterpriseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: ent, isLoading, isError, error } = useEnterprise(id)

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link href="/enterprises" className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft className="h-4 w-4" /> Enterprises
      </Link>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500"><Spinner /> Loading…</div>
      )}
      {isError && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{(error as Error).message}</div>}

      {ent && (
        <div className="space-y-5">
          <div>
            <h1 className="text-lg font-semibold text-stone-900">{ent.name ?? '(unnamed)'}</h1>
            <p className="font-mono text-xs text-stone-400">{ent.id}</p>
          </div>
          <SettingsCard ent={ent} />
          <SabreCard ent={ent} />
          <ZentrumhubCard ent={ent} />
          <SabreStatusCard id={ent.id} />
        </div>
      )}
    </div>
  )
}
