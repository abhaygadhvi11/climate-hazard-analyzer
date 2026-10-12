import math
import numpy as np
from scipy import stats
from typing import List, Tuple, Optional
from app.models import YearlyHazardMetric, TrendStatistics

def mann_kendall_test(x: List[float]) -> Tuple[str, float]:
    """
    Non-parametric Mann-Kendall test for monotonic trends in time series.
    Returns:
    - trend: 'increasing', 'decreasing', or 'no trend'
    - p_value: two-sided p-value
    """
    n = len(x)
    if n < 4:
        return "insufficient data", 1.0

    # Calculate Kendall's S statistic
    s = 0
    for k in range(n - 1):
        for j in range(k + 1, n):
            diff = x[j] - x[k]
            if diff > 0:
                s += 1
            elif diff < 0:
                s -= 1

    # Unique values and ties
    unique_x, counts = np.unique(x, return_counts=True)
    tie_term = sum(c * (c - 1) * (2 * c + 5) for c in counts if c > 1)

    var_s = (n * (n - 1) * (2 * n + 5) - tie_term) / 18.0
    if var_s <= 0:
        return "no trend", 1.0

    # Continuity correction
    if s > 0:
        z = (s - 1) / math.sqrt(var_s)
    elif s < 0:
        z = (s + 1) / math.sqrt(var_s)
    else:
        z = 0.0

    # Two-sided p-value from standard normal
    p_val = 2.0 * (1.0 - stats.norm.cdf(abs(z)))

    if p_val < 0.05:
        trend = "increasing" if z > 0 else "decreasing"
    else:
        trend = "no trend"

    return trend, float(round(p_val, 4))

def compute_trend_statistics(
    metrics: List[YearlyHazardMetric],
    location_name: Optional[str] = None
) -> TrendStatistics:
    """
    Computes rigorous trend statistics with honest climate insight generation.
    - Excludes years flagged as INSUFFICIENT data from regression.
    - Guards against division by zero.
    - Employs Mann-Kendall test for non-parametric validation.
    """
    valid_metrics = [m for m in metrics if m.data_quality == "VALID"]
    if len(valid_metrics) < 4:
        # Fallback if too few valid years
        valid_metrics = metrics

    years = np.array([m.year for m in valid_metrics], dtype=float)
    events = np.array([m.heatwave_events for m in valid_metrics], dtype=float)
    total_events = float(np.sum(events))

    # Linear regression (Ordinary Least Squares)
    slope, intercept, r_value, p_value, std_err = stats.linregress(years, events)
    slope_per_decade = float(round(slope * 10.0, 2))
    r_squared = float(round(r_value ** 2, 3))
    p_value_rounded = float(round(p_value, 4))
    is_significant = (p_value < 0.05)

    # Mann-Kendall test
    mk_trend, mk_p_val = mann_kendall_test(events.tolist())

    # Baseline decade vs Recent decade comparison
    n_years = len(valid_metrics)
    decade_span = min(10, max(3, n_years // 3))

    initial_slice = events[:decade_span]
    recent_slice = events[-decade_span:]

    baseline_decade_mean = float(round(np.mean(initial_slice), 2))
    recent_decade_mean = float(round(np.mean(recent_slice), 2))

    start_yr = int(years[0])
    end_yr = int(years[-1])
    initial_period_str = f"{start_yr}-{start_yr + decade_span - 1}"
    recent_period_str = f"{end_yr - decade_span + 1}-{end_yr}"

    # Calculate percent change with robust zero-division guards
    percent_change: Optional[float] = None
    narrative_parts: List[str] = []

    loc_prefix = f"In {location_name}, " if location_name else "In this region, "

    if total_events < 3:
        narrative = (
            f"{loc_prefix}heatwave events were infrequent (only {int(total_events)} detected "
            f"between {start_yr} and {end_yr}). The sample size is insufficient to establish a statistically robust trend."
        )
    elif baseline_decade_mean == 0.0:
        diff = recent_decade_mean - baseline_decade_mean
        sig_str = "statistically significant (p < 0.05)" if is_significant else "not yet statistically significant"
        narrative = (
            f"{loc_prefix}heatwaves emerged from an average of 0.0 events/year during {initial_period_str} "
            f"to {recent_decade_mean:.1f} events/year during {recent_period_str}. "
            f"Linear trend indicates {slope_per_decade:+.1f} events/decade ({sig_str})."
        )
    else:
        raw_change = ((recent_decade_mean - baseline_decade_mean) / baseline_decade_mean) * 100.0
        percent_change = float(round(raw_change, 1))
        direction = "increased" if percent_change >= 0 else "decreased"
        abs_change = abs(percent_change)

        sig_badge = (
            f"The trend is statistically significant (p = {p_value_rounded:.3f}, R² = {r_squared:.2f})."
            if is_significant else
            f"While an upward slope of {slope_per_decade:+.1f} events/decade is observed, it does not reach statistical significance (p = {p_value_rounded:.3f})."
        )

        narrative = (
            f"{loc_prefix}annual heatwave frequency has {direction} by {abs_change:.1f}% "
            f"when comparing {initial_period_str} (avg {baseline_decade_mean:.1f}/yr) to "
            f"{recent_period_str} (avg {recent_decade_mean:.1f}/yr). {sig_badge}"
        )

    return TrendStatistics(
        slope_events_per_decade=slope_per_decade,
        p_value=p_value_rounded,
        r_squared=r_squared,
        is_statistically_significant=is_significant,
        mann_kendall_trend=mk_trend,
        mann_kendall_p_value=mk_p_val,
        baseline_decade_mean=baseline_decade_mean,
        recent_decade_mean=recent_decade_mean,
        percent_change=percent_change,
        insight_narrative=narrative
    )
