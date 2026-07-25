(define (problem mine-scenario-1)
  (:domain haul-truck-dispatch)

  (:objects
    truck1 truck2 - truck
    ore1 waste1 - load
    yard pit-a pit-b jct mill dump - location
  )

  (:init
    (at truck1 yard)
    (at truck2 yard)
    (free truck1)
    (free truck2)

    (load-at ore1 pit-a)
    (ore ore1)
    (load-at waste1 pit-b)
    (waste waste1)

    (mill mill)
    (dump dump)

    ; One-way haul loop, the real traffic-control pattern open-pit mines use
    ; to keep loaded and empty trucks off the same narrow bench road.
    (connected yard pit-a)
    (connected yard pit-b)
    (connected pit-a jct)
    (connected pit-b jct)
    (connected jct mill)
    (connected jct dump)
    (connected mill yard)
    (connected dump yard)
  )

  (:goal (and (delivered ore1) (delivered waste1)))
)
