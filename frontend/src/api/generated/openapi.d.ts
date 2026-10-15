export interface paths {
    "/api/v1/analyses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Analyze */
        post: operations["analyze_api_v1_analyses_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health */
        get: operations["health_api_v1_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/regions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Regions */
        get: operations["regions_api_v1_regions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** AnalysisRegion */
        AnalysisRegion: {
            /**
             * Id
             * @enum {string}
             */
            id: "delhi" | "mumbai" | "bengaluru" | "chennai" | "hyderabad";
            /** Name */
            name: string;
            /** Latitude */
            latitude: number;
            /** Longitude */
            longitude: number;
            /** Timezone */
            timezone: string;
        };
        /** AnalysisResponse */
        AnalysisResponse: {
            region: components["schemas"]["AnalysisRegion"];
            period: components["schemas"]["Period"];
            methodology: components["schemas"]["Methodology"];
            summary: components["schemas"]["Summary"];
            /** Annual Metrics */
            annual_metrics: components["schemas"]["AnnualMetrics"][];
            trend: components["schemas"]["Trend"];
            /** Events */
            events: components["schemas"]["Event"][];
            /** Insights */
            insights: string[];
            data_quality: components["schemas"]["DataQuality"];
            source: components["schemas"]["Source"];
        };
        /** AnnualMetrics */
        AnnualMetrics: {
            /** Year */
            year: number;
            /** Expected Days */
            expected_days: number;
            /** Valid Days */
            valid_days: number;
            /** Coverage */
            coverage: number;
            /** Event Count */
            event_count: number;
            /** Heatwave Days */
            heatwave_days: number;
            /** Mean Duration Days */
            mean_duration_days: number | null;
            /** Max Duration Days */
            max_duration_days: number | null;
            /** Mean Exceedance Celsius */
            mean_exceedance_celsius: number | null;
            /** Peak Temperature Celsius */
            peak_temperature_celsius: number | null;
            /** Complete */
            complete: boolean;
            /** Partial */
            partial: boolean;
            /** Incomplete Reasons */
            incomplete_reasons: string[];
            /** Rolling Average Event Count */
            rolling_average_event_count: number | null;
        };
        /** BaselineQuality */
        BaselineQuality: {
            /** Expected Days */
            expected_days: number;
            /** Valid Days */
            valid_days: number;
            /** Coverage */
            coverage: number;
            /** Years */
            years: components["schemas"]["Coverage"][];
        };
        /** Comparison */
        Comparison: {
            first_window: components["schemas"]["ComparisonWindow"] | null;
            last_window: components["schemas"]["ComparisonWindow"] | null;
            /** Absolute Change Events Per Year */
            absolute_change_events_per_year: number | null;
            /** Percent Change */
            percent_change: number | null;
            /** Reason */
            reason: string | null;
            /** Percentage Unavailable Reason */
            percentage_unavailable_reason: string | null;
        };
        /** ComparisonWindow */
        ComparisonWindow: {
            /** Start Year */
            start_year: number;
            /** End Year */
            end_year: number;
            /** Mean Event Count */
            mean_event_count: number;
        };
        /** Coordinates */
        Coordinates: {
            /** Latitude */
            latitude: number;
            /** Longitude */
            longitude: number;
        };
        /** CountingMetadata */
        CountingMetadata: {
            /** Event Count */
            event_count: string;
            /** Duration */
            duration: string;
            /** Heatwave Days */
            heatwave_days: string;
            /** Intensity */
            intensity: string;
            /** Peak */
            peak: string;
            /** Boundary Policy */
            boundary_policy: string;
            /** Units */
            units: {
                [key: string]: string;
            };
        };
        /** Coverage */
        Coverage: {
            /** Year */
            year: number;
            /** Expected Days */
            expected_days: number;
            /** Valid Days */
            valid_days: number;
            /** Coverage */
            coverage: number;
        };
        /** DataQuality */
        DataQuality: {
            /** Warnings */
            warnings: string[];
            /** Incomplete Years */
            incomplete_years: number[];
            /** Excluded Boundary Events */
            excluded_boundary_events: components["schemas"]["Event"][];
            counting_metadata: components["schemas"]["CountingMetadata"];
        };
        /** ErrorBody */
        ErrorBody: {
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Details */
            details?: components["schemas"]["ValidationDetail"][] | null;
        };
        /** ErrorResponse */
        ErrorResponse: {
            error: components["schemas"]["ErrorBody"];
        };
        /** Event */
        Event: {
            /**
             * Observed Start Date
             * Format: date
             */
            observed_start_date: string;
            /**
             * Observed End Date
             * Format: date
             */
            observed_end_date: string;
            /** Observed Duration Days */
            observed_duration_days: number;
            /** Start Date */
            start_date: string | null;
            /** End Date */
            end_date: string | null;
            /** Duration Days */
            duration_days: number | null;
            /** Peak Temperature Celsius */
            peak_temperature_celsius: number | null;
            /** Mean Exceedance Celsius */
            mean_exceedance_celsius: number | null;
            /** Observed Peak Temperature Celsius */
            observed_peak_temperature_celsius: number;
            /** Observed Mean Exceedance Celsius */
            observed_mean_exceedance_celsius: number;
            /** Truncated Start */
            truncated_start: boolean;
            /** Truncated End */
            truncated_end: boolean;
            /** Qualification Confirmed */
            qualification_confirmed: boolean;
            /** Started In Selection */
            started_in_selection: boolean | null;
            /** Eligible For Complete Metrics */
            eligible_for_complete_metrics: boolean;
        };
        /** HealthResponse */
        HealthResponse: {
            /**
             * Status
             * @default ok
             * @constant
             */
            status?: "ok";
        };
        /** Methodology */
        Methodology: {
            /** Baseline Start Year */
            baseline_start_year: number;
            /** Baseline End Year */
            baseline_end_year: number;
            /** Percentile */
            percentile: number;
            /**
             * Percentile Method
             * @constant
             */
            percentile_method: "linear";
            /** Threshold Method Version */
            threshold_method_version: string;
            /** Threshold Celsius */
            threshold_celsius: number;
            /**
             * Temperature Variable
             * @constant
             */
            temperature_variable: "temperature_2m_max";
            /** Temperature Unit */
            temperature_unit: string;
            /**
             * Comparison
             * @constant
             */
            comparison: ">";
            /** Minimum Coverage */
            minimum_coverage: number;
            /**
             * Seasonal Adjustment
             * @constant
             */
            seasonal_adjustment: false;
            /** Limitation */
            limitation: string;
            baseline_quality: components["schemas"]["BaselineQuality"];
            /** Method Version */
            method_version: string;
            /**
             * Minimum Run Days
             * @constant
             */
            minimum_run_days: 3;
        };
        /** Period */
        Period: {
            /** Start Year */
            start_year: number;
            /** End Year */
            end_year: number;
            /**
             * Hazard
             * @constant
             */
            hazard: "heatwave";
        };
        /** Region */
        Region: {
            /**
             * Id
             * @enum {string}
             */
            id: "delhi" | "mumbai" | "bengaluru" | "chennai" | "hyderabad";
            /** Name */
            name: string;
            /** Latitude */
            latitude: number;
            /** Longitude */
            longitude: number;
            /** Timezone */
            timezone: string;
        };
        /** RegionsResponse */
        RegionsResponse: {
            /** Regions */
            regions: components["schemas"]["Region"][];
            supported_years?: components["schemas"]["SupportedYears"];
            defaults?: components["schemas"]["Selection"];
        };
        /** Regression */
        Regression: {
            /** Slope Events Per Decade */
            slope_events_per_decade: number | null;
            /** Fit Year Count */
            fit_year_count: number;
            /** Fit Years */
            fit_years: number[];
            /** Reason */
            reason: string | null;
            /** Interpretation */
            interpretation: string;
        };
        /** Selection */
        Selection: {
            /**
             * Region Id
             * @default delhi
             * @enum {string}
             */
            region_id?: "delhi" | "mumbai" | "bengaluru" | "chennai" | "hyderabad";
            /**
             * Start Year
             * @default 1990
             */
            start_year?: number;
            /**
             * End Year
             * @default 2020
             */
            end_year?: number;
            /**
             * Hazard
             * @default heatwave
             * @constant
             */
            hazard?: "heatwave";
        };
        /** Source */
        Source: {
            /**
             * Provider
             * @constant
             */
            provider: "Open-Meteo";
            /** Url */
            url: string;
            /** Licence */
            licence: string;
            /** Dataset */
            dataset: string;
            /** Changes */
            changes: string;
            /**
             * Model
             * @constant
             */
            model: "era5";
            /** Coordinate Version */
            coordinate_version: string;
            /** Weather Schema Version */
            weather_schema_version: number;
            /**
             * Generated At
             * Format: date-time
             */
            generated_at: string;
            /**
             * Analysis Cache Status
             * @enum {string}
             */
            analysis_cache_status: "computed" | "hit" | "coalesced";
            /** Weather Years */
            weather_years: components["schemas"]["WeatherSource"][];
        };
        /** Summary */
        Summary: {
            /** Event Count */
            event_count: number;
            /** Heatwave Days */
            heatwave_days: number;
            /** Mean Duration Days */
            mean_duration_days: number | null;
            /** Max Duration Days */
            max_duration_days: number | null;
            /** Mean Exceedance Celsius */
            mean_exceedance_celsius: number | null;
            /** Peak Temperature Celsius */
            peak_temperature_celsius: number | null;
            /** Complete */
            complete: boolean;
            /** Partial */
            partial: boolean;
            /** Eligible Year Count */
            eligible_year_count: number;
            /** Selected Year Count */
            selected_year_count: number;
            /** Excluded Boundary Event Count */
            excluded_boundary_event_count: number;
        };
        /** SupportedYears */
        SupportedYears: {
            /**
             * Min
             * @default 1990
             */
            min?: number;
            /**
             * Max
             * @default 2025
             */
            max?: number;
        };
        /** Trend */
        Trend: {
            regression: components["schemas"]["Regression"];
            comparison: components["schemas"]["Comparison"];
        };
        /** ValidationDetail */
        ValidationDetail: {
            /** Field */
            field: string;
            /** Code */
            code: string;
            /** Message */
            message: string;
        };
        /** WeatherSource */
        WeatherSource: {
            /** Year */
            year: number;
            /** Revision */
            revision: string;
            /**
             * Fetched At
             * Format: date-time
             */
            fetched_at: string;
            /**
             * Cache Status
             * @enum {string}
             */
            cache_status: "hit" | "fetched" | "refreshed" | "stale";
            grid_coordinates: components["schemas"]["Coordinates"];
            /** Timezone */
            timezone: string;
            /** Coverage */
            coverage: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    analyze_api_v1_analyses_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["Selection"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AnalysisResponse"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Timeout */
            408: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Request Entity Too Large */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Unprocessable Entity */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Bad Gateway */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Gateway Timeout */
            504: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    health_api_v1_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthResponse"];
                };
            };
        };
    };
    regions_api_v1_regions_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegionsResponse"];
                };
            };
        };
    };
}
