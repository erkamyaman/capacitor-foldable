package io.github.erkamyaman.foldable

import com.getcapacitor.Logger

class Foldable {

    fun echo(value: String): String {
        Logger.info("Echo", value)

        return value
    }
}
