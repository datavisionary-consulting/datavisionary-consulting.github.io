(define (problem mine-scenario-3)
  (:domain haul-truck-dispatch)

  (:objects
    truck1 truck2 - truck
    ore1 ore2 waste1 - load
    yard pit-a pit-b pit-c jct mill mill2 dump - location
  )

  (:init
    (at truck1 yard)
    (at truck2 yard)
    (free truck1)
    (free truck2)

    (load-at ore1 pit-a)
    (ore ore1)
    (load-at ore2 pit-c)
    (ore ore2)
    (load-at waste1 pit-b)
    (waste waste1)

    (mill mill)
    (mill mill2)
    (dump dump)

    (connected yard pit-a)
    (connected yard pit-b)
    (connected yard pit-c)
    (connected pit-a jct)
    (connected pit-b jct)
    (connected pit-c jct)
    (connected jct mill)
    (connected jct dump)
    (connected mill yard)
    (connected dump yard)

    ; Pit C has its own short dedicated haul road straight to the second
    ; mill -- a real layout choice for a bench sitting closer to a second
    ; processing pad than to the main one.
    (connected pit-c mill2)
    (connected mill2 yard)
  )

  (:goal (and (delivered ore1) (delivered ore2) (delivered waste1)))
)
