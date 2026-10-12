import os
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime

from app.config import settings

logger = logging.getLogger(__name__)

class NoSQLManager:
    """
    Unified NoSQL abstraction layer:
    - Primary: MongoDB / MongoDB Atlas (if MONGODB_URI is provided)
    - Zero-config fallback: Local TinyDB document store
    Caches daily climate observations at (grid_id, year) granularity.
    """
    def __init__(self):
        self.mode = "tinydb"
        self.mongo_client = None
        self.mongo_db = None
        self.tinydb = None
        self._init_storage()

    def _init_storage(self):
        if settings.MONGODB_URI:
            try:
                from pymongo import MongoClient
                self.mongo_client = MongoClient(
                    settings.MONGODB_URI,
                    serverSelectionTimeoutMS=3000
                )
                # Test connection
                self.mongo_client.admin.command('ping')
                self.mongo_db = self.mongo_client[settings.MONGODB_DB_NAME]
                # Ensure unique index on grid_id + year
                self.mongo_db.weather_cache.create_index([("grid_id", 1), ("year", 1)], unique=True)
                self.mode = "mongodb"
                logger.info("Connected to MongoDB at %s", settings.MONGODB_URI)
                return
            except Exception as e:
                logger.warning("Could not connect to MongoDB (%s). Falling back to TinyDB local storage.", e)

        # Fallback to TinyDB
        try:
            from tinydb import TinyDB, Query
            db_path = Path(settings.TINYDB_PATH)
            db_path.parent.mkdir(parents=True, exist_ok=True)
            self.tinydb = TinyDB(str(db_path))
            self.mode = "tinydb"
            logger.info("Using local NoSQL TinyDB at %s", settings.TINYDB_PATH)
        except Exception as e:
            logger.error("Failed to initialize TinyDB: %s", e)
            self.mode = "memory"
            self._mem_store: Dict[str, Any] = {}

    def get_year_cache(self, grid_id: str, year: int) -> Optional[Dict[str, Any]]:
        if self.mode == "mongodb":
            try:
                doc = self.mongo_db.weather_cache.find_one({"grid_id": grid_id, "year": year}, {"_id": 0})
                return doc
            except Exception as e:
                logger.error("MongoDB read error: %s", e)
                return None
        elif self.mode == "tinydb":
            try:
                from tinydb import Query
                Item = Query()
                res = self.tinydb.search((Item.grid_id == grid_id) & (Item.year == year))
                return res[0] if res else None
            except Exception as e:
                logger.error("TinyDB read error: %s", e)
                return None
        else:
            return self._mem_store.get(f"{grid_id}_{year}")

    def get_cached_years(self, grid_id: str, years: List[int]) -> Dict[int, Dict[str, Any]]:
        cached: Dict[int, Dict[str, Any]] = {}
        if self.mode == "mongodb":
            try:
                docs = self.mongo_db.weather_cache.find(
                    {"grid_id": grid_id, "year": {"$in": years}},
                    {"_id": 0}
                )
                for d in docs:
                    cached[d["year"]] = d
            except Exception as e:
                logger.error("MongoDB batch read error: %s", e)
        elif self.mode == "tinydb":
            try:
                from tinydb import Query
                Item = Query()
                res = self.tinydb.search((Item.grid_id == grid_id) & (Item.year.test(lambda y: y in years)))
                for d in res:
                    cached[d["year"]] = d
            except Exception as e:
                logger.error("TinyDB batch read error: %s", e)
        else:
            for y in years:
                key = f"{grid_id}_{y}"
                if key in self._mem_store:
                    cached[y] = self._mem_store[key]
        return cached

    def save_year_cache(
        self,
        grid_id: str,
        year: int,
        dates: List[str],
        tmax: List[Optional[float]],
        missing_count: int
    ) -> bool:
        doc = {
            "grid_id": grid_id,
            "year": year,
            "dates": dates,
            "tmax": tmax,
            "missing_count": missing_count,
            "updated_at": datetime.utcnow().isoformat()
        }
        if self.mode == "mongodb":
            try:
                self.mongo_db.weather_cache.update_one(
                    {"grid_id": grid_id, "year": year},
                    {"$set": doc},
                    upsert=True
                )
                return True
            except Exception as e:
                logger.error("MongoDB write error: %s", e)
                return False
        elif self.mode == "tinydb":
            try:
                from tinydb import Query
                Item = Query()
                self.tinydb.upsert(doc, (Item.grid_id == grid_id) & (Item.year == year))
                return True
            except Exception as e:
                logger.error("TinyDB write error: %s", e)
                return False
        else:
            self._mem_store[f"{grid_id}_{year}"] = doc
            return True

    def get_stats(self) -> Dict[str, Any]:
        """Returns diagnostic storage statistics."""
        count = 0
        if self.mode == "mongodb":
            try:
                count = self.mongo_db.weather_cache.count_documents({})
            except Exception:
                count = -1
        elif self.mode == "tinydb":
            try:
                count = len(self.tinydb)
            except Exception:
                count = -1
        else:
            count = len(self._mem_store)

        return {
            "mode": self.mode,
            "connected": True,
            "total_cached_year_records": count,
            "backend_storage": "MongoDB Atlas" if self.mode == "mongodb" else "Local NoSQL (TinyDB JSON Store)"
        }

db_manager = NoSQLManager()
