import { useState } from "react";
import Icon from "../components/Icon";
import AssetModal from "../modals/AssetModal";
import { VEHICLES, LOCATIONS, PARTNER_PROPS } from "../constants";

const Ph = ({ p }) => p ? <a href={`tel:${p}`} style={{ color: "inherit", textDecoration: "none" }}>{p}</a> : null;

function AssetGrid({ items, getFields, btnLabel }) {
  const [sel, setSel] = useState(null);
  return (
    <>
      <div className="ag">
        {items.map(item => (
          <div key={item.id} className="ac" onClick={() => setSel(item)}>
            <div className="athumb" style={{ background: item.grad }}>
              <Icon n={item.ico} s={50} c="#000" />
            </div>
            <div className="abody">
              <div className="aid">{item.id}</div>
              <div className="aname">{item.name}</div>
              <div className="asub">{item.sub}</div>
              {getFields(item).slice(0, 5).map(([l, v]) => (
                <div key={l} className="arow">
                  <span className="arl">{l}</span>
                  <span className="arv">{v}</span>
                </div>
              ))}
              <div className="ahistt">История в проектах</div>
              <div className="hchips">
                {item.history.map(h => (
                  <span key={h} style={{ background: "#E6F7FD", color: "#00AEEF", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{h}</span>
                ))}
              </div>
            </div>
            <div className="afoot">
              <button className="btn bp sm" style={{ flex: 1 }} onClick={e => { e.stopPropagation(); setSel(item); }}>
                {btnLabel}
              </button>
              <button className="btn bg sm" style={{ padding: "5px 9px" }} onClick={e => e.stopPropagation()}>
                <Icon n="cam" s={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {sel && <AssetModal item={sel} onClose={() => setSel(null)} fields={getFields(sel)} btnLabel={btnLabel} />}
    </>
  );
}

export function TransportView() {
  return (
    <div>
      <div className="tp-bar">
        <button className="btn bg sm"><Icon n="sliders" s={13} />Фильтры</button>
        <button className="btn bp sm"><Icon n="plus" s={13} c="#fff" />Добавить</button>
      </div>
      <AssetGrid
        items={VEHICLES}
        btnLabel="Забронировать"
        getFields={v => [
          ["Собственник", v.owner],
          ["Телефон", <Ph p={v.phone} />],
          ["Стоимость", v.price],
          ["КПП", v.gearbox],
          ["Водитель", v.driver],
        ]}
      />
    </div>
  );
}

export function LocationsView() {
  return (
    <div>
      <div className="tp-bar">
        <button className="btn bg sm"><Icon n="sliders" s={13} />Фильтры</button>
        <button className="btn bp sm"><Icon n="plus" s={13} c="#fff" />Добавить</button>
      </div>
      <AssetGrid
        items={LOCATIONS}
        btnLabel="Запросить"
        getFields={l => [
          ["Адрес", l.address],
          ["Собственник", l.owner],
          ["Телефон", <Ph p={l.phone} />],
          ["Стоимость", l.price],
          ["Доступ", l.access],
          ["Потолки", l.ceiling],
        ]}
      />
    </div>
  );
}

export function PartnerView() {
  return (
    <div>
      <div className="tp-bar">
        <button className="btn bg sm"><Icon n="sliders" s={13} />Фильтры</button>
        <button className="btn bp sm"><Icon n="plus" s={13} c="#fff" />Добавить</button>
      </div>
      <AssetGrid
        items={PARTNER_PROPS}
        btnLabel="Запросить"
        getFields={p => [
          ["Поставщик", p.supplier],
          ["Телефон", <Ph p={p.phone} />],
          ["Стоимость", p.price],
          ["Категория", p.cat],
          ["Состав", p.items],
        ]}
      />
    </div>
  );
}
