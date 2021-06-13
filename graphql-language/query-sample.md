# Query
```js
query liftsAndTrilsSimple {
  liftCount(status: OPEN)
  allLifts {
    name
    status
  }
}

query trials {
  allTrails {
    name
    difficulty
  }
}

query lifts {
  allLifts {
    name
    status
  }
}

query liftsAndTrils {
  open: liftCount(status: OPEN) # open is a alias
  chairlifts: allLifts {        # chairlifts is a alias
    liftName: name              # chairlifts is a alias
    status
  }
  skiSlopes: allTrails {        # skiSlopes is a alias
    name
    difficulty
  }
}

query closedStatus{
  Lift(id: "jazz-cat"){        # id is a parameter used to filter List collection
    name
    status,
    night,
    elevationGain
  }
}

query trailsAccessedByJazzCat{
  Lift(id:"jazz-cat"){      # link List to Trial
    capacity
    trailAccess{            # Trail type
      name 
      difficulty
    }
  }
}

query leftToAccessTrial{
  Trail(id : "dance-fight"){   # link Trial to Lift
    accessedByLifts{
      name
      capacity
    }
  }
}


# Here is an error, anonymous operation must be the only defined operation
# {
#  allLifts{
#    name
#    status
#  }
# }

```