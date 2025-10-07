import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Edit, Share2, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import ActivityEditDialog from './ActivityEditDialog';

const ItineraryDisplay = ({ itinerary, onSave, onShare }) => {
  const [editingActivity, setEditingActivity] = useState(null);
  const [localItinerary, setLocalItinerary] = useState(itinerary);

  const handleActivityUpdate = (updatedActivity) => {
    const updatedItinerary = { ...localItinerary };
    const dayIndex = updatedItinerary.days.findIndex(day => 
      day.activities.some(act => act.id === updatedActivity.id)
    );
    
    if (dayIndex !== -1) {
      const activityIndex = updatedItinerary.days[dayIndex].activities.findIndex(
        act => act.id === updatedActivity.id
      );
      updatedItinerary.days[dayIndex].activities[activityIndex] = updatedActivity;
      setLocalItinerary(updatedItinerary);
    }
    
    setEditingActivity(null);
  };

  const moveActivity = (dayIndex, activityIndex, direction) => {
    const updatedItinerary = { ...localItinerary };
    const activities = [...updatedItinerary.days[dayIndex].activities];
    
    if (direction === 'up' && activityIndex > 0) {
      [activities[activityIndex], activities[activityIndex - 1]] = 
      [activities[activityIndex - 1], activities[activityIndex]];
    } else if (direction === 'down' && activityIndex < activities.length - 1) {
      [activities[activityIndex], activities[activityIndex + 1]] = 
      [activities[activityIndex + 1], activities[activityIndex]];
    }
    
    updatedItinerary.days[dayIndex].activities = activities;
    setLocalItinerary(updatedItinerary);
  };

  const deleteActivity = (dayIndex, activityIndex) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      const updatedItinerary = { ...localItinerary };
      updatedItinerary.days[dayIndex].activities.splice(activityIndex, 1);
      setLocalItinerary(updatedItinerary);
    }
  };

  const addActivity = (dayIndex) => {
    const newActivity = {
      id: Date.now().toString(),
      title: 'New Activity',
      type: 'activity',
      description: 'Add description here',
      location: '',
      startTime: '09:00',
      endTime: '10:00',
      cost: 0,
      notes: ''
    };
    
    const updatedItinerary = { ...localItinerary };
    updatedItinerary.days[dayIndex].activities.push(newActivity);
    setLocalItinerary(updatedItinerary);
    setEditingActivity(newActivity);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'accommodation': return '🏨';
      case 'activity': return '🎯';
      case 'restaurant': return '🍽️';
      case 'transport': return '🚌';
      default: return '📍';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'accommodation': return 'bg-blue-100 text-blue-800';
      case 'activity': return 'bg-green-100 text-green-800';
      case 'restaurant': return 'bg-orange-100 text-orange-800';
      case 'transport': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{localItinerary.title}</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => onSave(localItinerary)}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button
            onClick={() => onShare(localItinerary)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Days and Activities */}
      <div className="space-y-6">
        {localItinerary.days.map((day, dayIndex) => (
          <Card key={day.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Day {day.dayNumber} - {new Date(day.date).toLocaleDateString()}
                </CardTitle>
                <Button
                  onClick={() => addActivity(dayIndex)}
                  size="sm"
                  variant="outline"
                >
                  Add Activity
                </Button>
              </div>
              {day.description && (
                <p className="text-sm text-gray-600 mt-1">{day.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {day.activities.map((activity, activityIndex) => (
                  <div
                    key={activity.id}
                    className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                            {getTypeIcon(activity.type)} {activity.type}
                          </span>
                          {activity.cost && (
                            <span className="text-sm font-medium text-green-600">
                              ${activity.cost}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900">{activity.title}</h4>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )}
                        {activity.location && (
                          <p className="text-sm text-gray-500 mt-1">📍 {activity.location}</p>
                        )}
                        {activity.startTime && activity.endTime && (
                          <p className="text-sm text-gray-500 mt-1">
                            ⏰ {activity.startTime} - {activity.endTime}
                          </p>
                        )}
                        {activity.notes && (
                          <p className="text-sm text-gray-500 mt-1">💭 {activity.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingActivity(activity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveActivity(dayIndex, activityIndex, 'up')}
                          disabled={activityIndex === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveActivity(dayIndex, activityIndex, 'down')}
                          disabled={activityIndex === day.activities.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteActivity(dayIndex, activityIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {day.activities.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No activities planned for this day yet.</p>
                    <Button
                      onClick={() => addActivity(dayIndex)}
                      size="sm"
                      variant="outline"
                      className="mt-2"
                    >
                      Add your first activity
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Edit Dialog */}
      {editingActivity && (
        <ActivityEditDialog
          activity={editingActivity}
          isOpen={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          onSave={handleActivityUpdate}
        />
      )}
    </div>
  );
};

export default ItineraryDisplay;