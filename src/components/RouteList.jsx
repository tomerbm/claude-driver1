import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { STATUS, STATUS_COLOR } from "../data/packages";

function StopCard({ stop, index, isActive, onSelect, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusColor = STATUS_COLOR[stop.status] || STATUS_COLOR[STATUS.PENDING];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`stop-card ${isActive ? "stop-card--active" : ""} stop-card--${stop.status}`}
      onClick={() => onSelect(index)}
    >
      <div className="stop-card__drag" {...attributes} {...listeners}>
        <GripIcon />
      </div>

      <div className="stop-card__badge" style={{ background: statusColor }}>
        {index + 1}
      </div>

      <div className="stop-card__info">
        <div className="stop-card__name">{stop.recipient}</div>
        <div className="stop-card__address">{stop.address}, {stop.city}</div>
        {stop.notes && <div className="stop-card__notes">{stop.notes}</div>}
        <div className="stop-card__weight">{stop.weight}</div>
      </div>

      <div className="stop-card__actions" onClick={(e) => e.stopPropagation()}>
        <div className="status-badge" style={{ background: statusColor }}>
          {stop.statusLabel}
        </div>
        <div className="status-buttons">
          <button
            className={`status-btn delivered ${stop.status === STATUS.DELIVERED ? "active" : ""}`}
            onClick={() => onStatusChange(stop.id, STATUS.DELIVERED)}
            title="Delivered"
          >✓</button>
          <button
            className={`status-btn no-one-home ${stop.status === STATUS.NO_ONE_HOME ? "active" : ""}`}
            onClick={() => onStatusChange(stop.id, STATUS.NO_ONE_HOME)}
            title="No One Home"
          >🏠</button>
          <button
            className={`status-btn return ${stop.status === STATUS.RETURN ? "active" : ""}`}
            onClick={() => onStatusChange(stop.id, STATUS.RETURN)}
            title="Return"
          >↩</button>
        </div>
      </div>
    </div>
  );
}

function GripIcon() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <circle cx="5" cy="4" r="1.5" />
      <circle cx="11" cy="4" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="11" cy="12" r="1.5" />
    </svg>
  );
}

export default function RouteList({ t, stops, activeIndex, onReorder, onSelect, onStatusChange, onOptimize }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex((s) => s.id === active.id);
      const newIndex = stops.findIndex((s) => s.id === over.id);
      onReorder(arrayMove(stops, oldIndex, newIndex));
    }
  }

  if (stops.length === 0) {
    return (
      <div className="route-list">
        <div className="route-list__empty">{t.routeEmpty}</div>
      </div>
    );
  }

  const done = stops.filter((s) => s.status !== STATUS.PENDING).length;

  return (
    <div className="route-list">
      <div className="route-list__header">
        <h2 className="panel-title">{t.routeTitle}</h2>
        <div className="route-list__header-right">
          <span className="route-progress">{done}/{stops.length} {t.done}</span>
          <button className="btn-optimize" onClick={onOptimize} title="Re-optimize route">
            {t.optimize}
          </button>
        </div>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {stops.map((stop, idx) => (
            <StopCard
              key={stop.id}
              stop={stop}
              index={idx}
              isActive={idx === activeIndex}
              onSelect={onSelect}
              onStatusChange={onStatusChange}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
