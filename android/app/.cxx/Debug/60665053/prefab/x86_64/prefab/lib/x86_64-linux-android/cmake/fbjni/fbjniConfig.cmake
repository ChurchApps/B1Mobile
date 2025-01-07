if(NOT TARGET fbjni::fbjni)
add_library(fbjni::fbjni SHARED IMPORTED)
set_target_properties(fbjni::fbjni PROPERTIES
    IMPORTED_LOCATION "/Users/vishalsharma/.gradle/caches/8.10.2/transforms/ee4713c89dc69faa668500deaee892a4/transformed/fbjni-0.6.0/prefab/modules/fbjni/libs/android.x86_64/libfbjni.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/vishalsharma/.gradle/caches/8.10.2/transforms/ee4713c89dc69faa668500deaee892a4/transformed/fbjni-0.6.0/prefab/modules/fbjni/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

