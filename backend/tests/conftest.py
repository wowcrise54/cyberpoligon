import sys
from pathlib import Path

# add backend directory to sys.path for module imports
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
