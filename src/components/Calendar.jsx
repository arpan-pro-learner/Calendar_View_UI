import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./Calendar.css";

const initialEvents = [
  {
    id: 1,
    resource: "Resource A",
    start: "2025-02-02",
    end: "2025-02-03",
    title: "Event 1",
    time: "12:00 AM - 12:00 AM",
    color: "event-pink",
  },
  {
    id: 2,
    resource: "Resource C",
    start: "2025-02-10",
    end: "2025-02-11",
    title: "Event 2",
    time: "9:00 AM - 3:00 PM",
    color: "event-blue",
  },
  {
    id: 3,
    resource: "Resource B",
    start: "2025-02-12",
    end: "2025-02-13",
    title: "Event 3",
    time: "11:45 PM - 11:45 PM",
    color: "event-green",
  },
  {
    id: 4,
    resource: "Resource E",
    start: "2025-02-15",
    end: "2025-02-18",
    title: "Event 4",
    time: "7:00 AM - 12:00 PM",
    color: "event-green",
  },
  {
    id: 5,
    resource: "Resource E",
    start: "2025-02-05",
    end: "2025-02-12",
    title: "Event 5",
    time: "2:15 AM - 2:15 AM",
    color: "event-green",
  },
  {
    id: 6,
    resource: "Resource G",
    start: "2025-02-10",
    end: "2025-02-11",
    title: "Event 6",
    time: "8:00 AM - 8:00 PM",
    color: "event-cyan",
  },
  {
    id: 7,
    resource: "Resource G",
    start: "2025-02-24",
    end: "2025-02-25",
    title: "Event 7",
    time: "12:00 AM - 12:00 AM",
    color: "event-cyan",
  },
  {
    id: 10,
    resource: "Resource K",
    start: "2025-02-05",
    end: "2025-02-06",
    title: "Event 10",
    time: "4:30 PM - 3:50 AM",
    color: "event-cyan",
  },
];
// Replace the resources constant with:
const initialResources = [
  "Resource A",
  "Resource B",
  "Resource C",
  "Resource D",
  "Resource E",
  "Resource F",
  "Resource G",
  "Resource H",
  "Resource I",
  "Resource J",
  "Resource K",
  "Resource L",
  "Resource M",
  "Resource N",
];
const EVENT_COLORS = [
  "event-pink",
  "event-blue",
  "event-green",
  "event-cyan",
  "event-yellow",
  "event-orange",
  "event-purple",
  "event-red",
];

// Draggable Event Component
const DraggableEvent = ({ event, style }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "EVENT",
    item: { id: event.id, originalResource: event.resource },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`event-block ${event.color}`}
      style={{
        ...style,
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      <div className="event-title">{event.title}</div>
      <div className="event-time">{event.time}</div>
    </div>
  );
};

// Droppable Resource Row
const DroppableResourceRow = ({
  resource,
  events,
  onEventMove,
  getEventStyle,
  currentDate,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "EVENT",
    drop: (item, monitor) => {
      const dropOffset = monitor.getClientOffset();
      const rowRect = document
        .getElementById(`resource-row-${resource}`)
        .getBoundingClientRect();
      const relativeX = dropOffset.x - rowRect.left;
      const totalDays = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate();
      const dayWidth = rowRect.width / totalDays;
      const droppedDay = Math.floor(relativeX / dayWidth) + 1;

      onEventMove(item.id, resource, droppedDay);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      id={`resource-row-${resource}`}
      ref={drop}
      className={`resource-row ${isOver ? "drop-target" : ""}`}
    >
      {events
        .filter((event) => event.resource === resource)
        .map((event) => (
          <DraggableEvent
            key={event.id}
            event={event}
            style={getEventStyle(event)}
          />
        ))}
    </div>
  );
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1));
  const [events, setEvents] = useState(initialEvents);
  const [resources, setResources] = useState(initialResources);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  // Add these with your other state declarations
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResourceName, setNewResourceName] = useState("");
  const [newEventData, setNewEventData] = useState({
    title: "",
    resource: "",
    start: "",
    end: "",
    startTime: "00:00",
    endTime: "00:00",
    time: "12:00 AM - 12:00 AM",
  });

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const formatDate = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  };

  const getEventStyle = (event) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const startDay = startDate.getDate();
    const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
    const totalDays = getDaysInMonth(currentDate);

    return {
      left: `${(startDay - 1) * (100 / totalDays)}%`,
      width: `${duration * (100 / totalDays)}%`,
    };
  };

  const navigateMonth = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  // Update the isCurrentDay function
  const isCurrentDay = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Update the navigateToToday function
  const navigateToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleEventMove = (eventId, newResource, newDay) => {
    setEvents((prevEvents) => {
      return prevEvents.map((event) => {
        if (event.id === eventId) {
          const startDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            newDay
          );
          const endDate = new Date(startDate);
          const duration =
            (new Date(event.end) - new Date(event.start)) /
            (1000 * 60 * 60 * 24);
          endDate.setDate(startDate.getDate() + duration);

          return {
            ...event,
            resource: newResource,
            start: startDate.toISOString().split("T")[0],
            end: endDate.toISOString().split("T")[0],
          };
        }
        return event;
      });
    });
  };

  const handleAddEvent = () => {
    if (
      !newEventData.title ||
      !newEventData.resource ||
      !newEventData.start ||
      !newEventData.end
    ) {
      alert("Please fill in all fields");
      return;
    }

    const newEvent = {
      id: Date.now(),
      ...newEventData,
      color: EVENT_COLORS[events.length % EVENT_COLORS.length],
    };

    setEvents((prev) => [...prev, newEvent]);
    setIsAddingEvent(false);
    setNewEventData({
      title: "",
      resource: "",
      start: "",
      end: "",
      time: "12:00 AM - 12:00 AM",
    });
  };
  // Add this with your other handler functions
  const handleAddResource = () => {
    if (!newResourceName.trim()) {
      alert("Please enter a resource name");
      return;
    }

    if (resources.includes(newResourceName)) {
      alert("Resource already exists");
      return;
    }

    setResources((prev) => [...prev, newResourceName]);
    setNewResourceName("");
    setIsAddingResource(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="month-title text-blue-600">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <div className="calendar-controls">
          
            <div className="nav-buttons">
              <button className="nav-btn" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="nav-icon" />
              </button>  <button
              className="today-btn bg-blue-600 text-white"
              onClick={navigateToToday}
            >
              Today
            </button>
              <button className="nav-btn" onClick={() => navigateMonth(1)}>
                <ChevronRight className="nav-icon" />
              </button>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="add-event-button"
            onClick={() => setIsAddingEvent(true)}
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
          <button
            className="add-resource-button"
            onClick={() => setIsAddingResource(true)}
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        </div>

        {isAddingEvent && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Add New Event</h3>
                <button
                  className="modal-close"
                  onClick={() => setIsAddingEvent(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Event Title</label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    value={newEventData.title}
                    onChange={(e) =>
                      setNewEventData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Resource</label>
                  <select
                    value={newEventData.resource}
                    onChange={(e) =>
                      setNewEventData((prev) => ({
                        ...prev,
                        resource: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Resource</option>
                    {resources.map((resource) => (
                      <option key={resource} value={resource}>
                        {resource}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={newEventData.start}
                      onChange={(e) =>
                        setNewEventData((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={newEventData.startTime || "00:00"}
                      onChange={(e) =>
                        setNewEventData((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                          time: `${e.target.value} - ${
                            prev.endTime || "00:00"
                          }`,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={newEventData.end}
                      onChange={(e) =>
                        setNewEventData((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={newEventData.endTime || "00:00"}
                      onChange={(e) =>
                        setNewEventData((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                          time: `${prev.startTime || "00:00"} - ${
                            e.target.value
                          }`,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setIsAddingEvent(false)}
                >
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleAddEvent}>
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add this after the Add Event modal */}
        {isAddingResource && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Add New Resource</h3>
                <button
                  className="modal-close"
                  onClick={() => setIsAddingResource(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Resource Name</label>
                  <input
                    type="text"
                    placeholder="Enter resource name"
                    value={newResourceName}
                    onChange={(e) => setNewResourceName(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setIsAddingResource(false)}
                >
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleAddResource}>
                  Add Resource
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="calendar-body">
          <div className="date-header">
            <div className="resource-header">Resource</div>
            <div className="dates-row">
              {Array.from(
                { length: getDaysInMonth(currentDate) },
                (_, i) => i + 1
              ).map((day) => (
                <div
                  key={day}
                  className={`date-cell ${
                    isCurrentDay(day) ? "current-date" : ""
                  }`}
                >
                  <span className="day-name">{formatDate(day)}</span>
                  <span className="day-number">{day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="calendar-grid">
            <div className="resources-column">
              {resources.map((resource) => (
                <div key={resource} className="resource-cell">
                  {resource}
                </div>
              ))}
            </div>

            <div className="events-grid">
              <div className="grid-background">
                {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => (
                  <div key={i} className="grid-column" />
                ))}
              </div>

              <div className="events-container">
                {resources.map((resource) => (
                  <DroppableResourceRow
                    key={resource}
                    resource={resource}
                    events={events.filter((event) => {
                      const eventDate = new Date(event.start);
                      return (
                        eventDate.getMonth() === currentDate.getMonth() &&
                        eventDate.getFullYear() === currentDate.getFullYear()
                      );
                    })}
                    onEventMove={handleEventMove}
                    getEventStyle={getEventStyle}
                    currentDate={currentDate}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
