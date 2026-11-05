# garmin-connect-mcp

MCP server for Garmin Connect. Access your fitness, health, and training data from Claude Code, Claude Desktop, Cursor, Windsurf, or any MCP client.

**97 tools** across 13 categories: activities, daily health, trends, sleep, body composition, performance, profile and devices, date ranges, daily snapshot, training plans, wellness, challenges, and writes.

This README count is the number of `server.registerTool` calls under `src/tools/` (tests excluded).

API endpoints and authentication flow based on [`python-garminconnect`](https://github.com/cyberjunky/python-garminconnect) by [cyberjunky](https://github.com/cyberjunky).

## Requirements

- Node.js 20+
- A Garmin Connect account (email and password)

## Installation

### Claude Code

```bash
claude mcp add garmin -e GARMIN_EMAIL=you@email.com -e GARMIN_PASSWORD=yourpass -- npx -y @nicolasvegam/garmin-connect-mcp
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "garmin": {
      "command": "npx",
      "args": ["-y", "@nicolasvegam/garmin-connect-mcp"],
      "env": {
        "GARMIN_EMAIL": "you@email.com",
        "GARMIN_PASSWORD": "yourpass"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "garmin": {
      "command": "npx",
      "args": ["-y", "@nicolasvegam/garmin-connect-mcp"],
      "env": {
        "GARMIN_EMAIL": "you@email.com",
        "GARMIN_PASSWORD": "yourpass"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "garmin": {
      "command": "npx",
      "args": ["-y", "@nicolasvegam/garmin-connect-mcp"],
      "env": {
        "GARMIN_EMAIL": "you@email.com",
        "GARMIN_PASSWORD": "yourpass"
      }
    }
  }
}
```

### Any MCP Client

Run the server with environment variables:

```bash
GARMIN_EMAIL=you@email.com GARMIN_PASSWORD=yourpass npx -y @nicolasvegam/garmin-connect-mcp
```

The server communicates over stdio using the [Model Context Protocol](https://modelcontextprotocol.io/).

## Available Tools

Categories follow the modules registered in `src/index.ts` (`src/tools/*.tools.ts`). Each heading count is the number of `server.registerTool` calls in that file.

### Activities (`activities.tools.ts`, 16 tools)
| Tool | Description |
|------|-------------|
| `get_activities` | Recent activities with pagination: type, duration, distance, calories, heart rate |
| `get_activities_by_date` | Activities in a date range, with an optional activity type filter |
| `get_last_activity` | Most recent activity |
| `count_activities` | Total number of activities |
| `get_activity` | Summary data for a specific activity |
| `get_activity_details` | Detailed metrics: HR, pace, elevation, cadence, and power time series |
| `get_activity_splits` | Per-km or per-mile split data |
| `get_activity_weather` | Weather during an activity: temperature, humidity, wind, condition |
| `get_activity_hr_zones` | Time spent in each heart rate zone |
| `get_activity_exercise_sets` | Strength training sets: reps, weight, and duration |
| `get_activity_types` | Available activity types |
| `get_activity_gear` | Gear used during a specific activity |
| `get_activity_typed_splits` | Typed splits, such as active versus rest intervals |
| `get_activity_split_summaries` | Split summaries with aggregate stats per split |
| `get_activity_power_in_timezones` | Power time in zones for cycling or running power activities |
| `get_progress_summary` | Distance, duration, or calories over a date range, grouped by activity type |

### Daily Health (`health.tools.ts`, 14 tools)
| Tool | Description |
|------|-------------|
| `get_daily_summary` | Daily summary: steps, calories, distance, floors, active minutes, heart rate, stress, body battery |
| `get_steps` | Step count for a date (daily total and intraday chart) |
| `get_steps_chart` | Intraday step chart |
| `get_heart_rate` | Resting, max, min, and heart rate time series for a date |
| `get_resting_heart_rate` | Resting heart rate for a date |
| `get_stress` | Daily stress score, time in rest/low/medium/high, and time series |
| `get_body_battery` | Body Battery charged, drained, highest, and lowest (`endDate` defaults to `startDate`) |
| `get_body_battery_events` | Body Battery charge and drain events for a day |
| `get_respiration` | Respiration rate for a single date |
| `get_spo2` | Blood oxygen (SpO2) for a single date |
| `get_intensity_minutes` | Moderate and vigorous intensity minutes |
| `get_floors` | Floors climbed chart for a date |
| `get_hydration` | Daily hydration (water intake) |
| `get_daily_events` | Daily wellness events |

### Trends (`trends.tools.ts`, 4 tools)
| Tool | Description |
|------|-------------|
| `get_daily_steps_range` | Daily step counts over a date range (ranges longer than 28 days are chunked) |
| `get_weekly_steps` | Weekly step totals (default 52 weeks, maximum 52) |
| `get_weekly_stress` | Weekly stress aggregates (default 52 weeks, maximum 52) |
| `get_weekly_intensity_minutes` | Weekly intensity minutes over a date range |

### Sleep (`sleep.tools.ts`, 2 tools)
| Tool | Description |
|------|-------------|
| `get_sleep_data` | One night: stages (deep, light, REM, awake), score, duration, bed and wake times |
| `get_sleep_data_raw` | Raw wellness sleep data, including heart rate and SpO2 during sleep |

### Body Composition (`body.tools.ts`, 5 tools)
| Tool | Description |
|------|-------------|
| `get_body_composition` | Weight, BMI, body fat %, muscle mass, bone mass, and body water % over a date range |
| `get_latest_weight` | Most recent weight entry |
| `get_daily_weigh_ins` | Weigh-ins for a specific date |
| `get_weigh_ins` | Weigh-ins over a date range |
| `get_blood_pressure` | Blood pressure readings over a date range |

### Performance (`performance.tools.ts`, 11 tools)
| Tool | Description |
|------|-------------|
| `get_vo2max` | VO2 Max for a date (running and cycling). Today's value may be missing; use yesterday |
| `get_training_readiness` | Training Readiness from sleep, recovery, training load, and HRV |
| `get_training_status` | Training status and load: productive, maintaining, detraining, peaking, recovery, or overreaching |
| `get_hrv` | Heart rate variability for a date |
| `get_endurance_score` | Endurance Score for one date, or a range with daily, weekly, or monthly aggregation |
| `get_hill_score` | Hill Score for one date, or a range with daily, weekly, or monthly aggregation |
| `get_race_predictions` | Predicted times for 5K, 10K, half marathon, and marathon |
| `get_fitness_age` | Fitness Age from fitness level, activity, and body metrics |
| `get_personal_records` | Personal records, including longest run and fastest race distances |
| `get_lactate_threshold` | Lactate threshold heart rate and pace (latest, or a historical range) |
| `get_cycling_ftp` | Latest cycling functional threshold power (FTP) |

### Profile & Devices (`profile.tools.ts`, 15 tools)
| Tool | Description |
|------|-------------|
| `get_user_profile` | Social profile: name, location, profile image, activity preferences, level |
| `get_user_settings` | Measurement system, time and date format, sleep schedule, HR zones, hydration preferences |
| `get_devices` | Registered Garmin devices: model, firmware, last sync |
| `get_device_settings` | Settings for a specific device |
| `get_device_last_used` | Last used device |
| `get_primary_training_device` | Primary training device |
| `get_device_solar_data` | Solar charging data for a solar-equipped device |
| `get_gear` | Tracked gear: shoes, bikes, and other equipment |
| `get_gear_stats` | Usage statistics for one gear item |
| `get_goals` | Active step, activity, and weight goals, with progress |
| `get_earned_badges` | Earned badges and achievements |
| `get_workouts` | Saved workouts |
| `get_workout` | One workout definition by ID |
| `get_gear_activities` | Activities linked to a gear item |
| `get_gear_defaults` | Default gear assignments per activity type |

### Date Ranges (`range.tools.ts`, 7 tools)
| Tool | Description |
|------|-------------|
| `get_sleep_data_range` | Sleep data day by day over a date range |
| `get_hrv_range` | HRV day by day over a date range |
| `get_stress_range` | Daily stress day by day over a date range |
| `get_spo2_range` | SpO2 day by day over a date range |
| `get_respiration_range` | Respiration day by day over a date range |
| `get_training_readiness_range` | Training Readiness day by day over a date range |
| `get_vo2max_range` | VO2 Max day by day over a date range |

### Daily Snapshot (`snapshot.tools.ts`, 1 tool)
| Tool | Description |
|------|-------------|
| `get_daily_health_snapshot` | One call for summary, heart rate, stress, body battery, sleep, HRV, respiration, SpO2, steps, floors, and intensity minutes |

### Training Plans (`training.tools.ts`, 4 tools)
| Tool | Description |
|------|-------------|
| `get_training_plans` | Garmin Coach and custom training plans |
| `get_training_plan_by_id` | One training plan, including schedule and workouts |
| `get_adaptive_training_plan_by_id` | One adaptive (Garmin Coach) training plan by ID |
| `get_scheduled_workout_by_id` | One scheduled workout from a training plan |

### Wellness (`wellness.tools.ts`, 4 tools)
| Tool | Description |
|------|-------------|
| `get_menstrual_calendar_data` | Menstrual calendar for a date range: phases, predictions, symptoms |
| `get_menstrual_data_for_date` | Cycle day view for one date: phase, symptoms, predictions |
| `get_pregnancy_summary` | Pregnancy tracking summary |
| `get_lifestyle_logging_data` | Lifestyle logging for a date |

### Challenges (`challenges.tools.ts`, 6 tools)
| Tool | Description |
|------|-------------|
| `get_available_badges` | Badges that can be earned |
| `get_adhoc_challenges` | Historical ad-hoc challenges the account has joined |
| `get_badge_challenges` | Completed badge challenges |
| `get_available_badge_challenges` | Badge challenges that can be joined |
| `get_non_completed_badge_challenges` | Badge challenges that are started and not finished |
| `get_inprogress_virtual_challenges` | Virtual challenges currently in progress |

### Writes (`write.tools.ts`, 8 tools)
| Tool | Description |
|------|-------------|
| `set_activity_name` | Rename an activity |
| `create_manual_activity` | Create a manual activity (`activityTypeKey` comes from `get_activity_types`) |
| `delete_activity` | Delete an activity permanently |
| `add_weigh_in` | Record a weight measurement |
| `set_hydration` | Set daily hydration intake in milliliters |
| `set_blood_pressure` | Record systolic, diastolic, and pulse |
| `add_gear_to_activity` | Link a gear item to an activity |
| `remove_gear_from_activity` | Unlink a gear item from an activity |

## Limitations

**Can I read activities from another user's public Garmin profile?**

No. Every tool uses the Garmin Connect account you authenticate (`GARMIN_EMAIL` and `GARMIN_PASSWORD`), including the write tools above. Requests do not take another user id, a public profile, or a group member. This server does not call a public-profile or third-party activity API. Reading other accounts, including public profiles you can see on the Garmin Connect website, is out of scope for now. See [issue #9](https://github.com/Nicolasvegam/garmin-connect-mcp/issues/9).

## Authentication

Uses Garmin Connect credentials (email/password) via environment variables. OAuth tokens are cached in `~/.garmin-mcp/` to avoid re-authentication on each request.

### MFA (Multi-Factor Authentication)

If your Garmin account has MFA enabled (required for devices with ECG capabilities), you need to run the interactive setup once before using the MCP server:

```bash
GARMIN_EMAIL='you@email.com' GARMIN_PASSWORD='yourpass' npx -y @nicolasvegam/garmin-connect-mcp setup
```

The same flow is available as its own executable, `garmin-connect-mcp-setup`:

```bash
GARMIN_EMAIL='you@email.com' GARMIN_PASSWORD='yourpass' npx -y --package @nicolasvegam/garmin-connect-mcp garmin-connect-mcp-setup
```

This will:
1. Log in to Garmin Connect
2. Prompt you for the MFA code sent to your email or authenticator app (the setup command asks for the code on the terminal; the MCP server itself cannot)
3. Save OAuth tokens to `~/.garmin-mcp/`

After setup, the MCP server will use the saved tokens automatically — no MFA prompt needed until the tokens expire. When they do, simply run the setup command again.

## Development

```bash
git clone https://github.com/Nicolasvegam/garmin-connect-mcp.git
cd garmin-connect-mcp
npm install
npm run build
npm test
```

To test locally:

```bash
GARMIN_EMAIL=you@email.com GARMIN_PASSWORD=yourpass npm start
```

## Credits

- API endpoints and authentication flow based on [`python-garminconnect`](https://github.com/cyberjunky/python-garminconnect) by [cyberjunky](https://github.com/cyberjunky)

## License

MIT
